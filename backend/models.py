"""
VISHWAS-FDR | SQLAlchemy ORM Models
Team OG-7 | SIH 2026 | PS-26265
"""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, Column, Float, ForeignKey, Integer, String, Text, create_engine,
)
from sqlalchemy.orm import DeclarativeBase, Session, relationship, sessionmaker

DATABASE_URL = "sqlite:///./vishwas_fdr.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


# ─────────────────────────────────────────────
# 4.1  Institution
# ─────────────────────────────────────────────
class Institution(Base):
    __tablename__ = "institutions"

    id                  = Column(Integer, primary_key=True, index=True)
    aishe_code          = Column(String, unique=True, nullable=False)
    name                = Column(String, nullable=False)
    state               = Column(String, nullable=False)
    category            = Column(String, nullable=False)          # ENGINEERING_NEW | PHARMACY | MBA_MCA | ARCHITECTURE
    required_fdr_amount = Column(Float, nullable=False)
    pgrc_clearance      = Column(Boolean, default=True)
    vigilance_clearance = Column(Boolean, default=True)
    grants_clearance    = Column(Boolean, default=True)

    fdrs = relationship("FDRRecord", back_populates="institution")


# ─────────────────────────────────────────────
# 4.2  FDRRecord
# ─────────────────────────────────────────────
class FDRRecord(Base):
    __tablename__ = "fdr_records"

    id                       = Column(Integer, primary_key=True, index=True)
    institution_id           = Column(Integer, ForeignKey("institutions.id"), nullable=False)

    fdr_number               = Column(String, nullable=False)
    issuing_bank             = Column(String, nullable=False)
    ifsc_code                = Column(String, nullable=False)
    branch_email             = Column(String, nullable=True)
    is_scheduled_bank        = Column(Boolean, default=True)
    account_holder_text      = Column(String, nullable=True)
    is_joint_aicte           = Column(Boolean, default=False)

    principal_amount         = Column(Float, nullable=False)
    interest_rate            = Column(Float, nullable=False)
    issue_date               = Column(String, nullable=False)       # YYYY-MM-DD
    maturity_date            = Column(String, nullable=False)       # YYYY-MM-DD
    printed_maturity_amount  = Column(Float, nullable=True)
    calculated_maturity_amount = Column(Float, nullable=True)
    math_discrepancy         = Column(Float, nullable=True)

    trust_status             = Column(String, default="SUBMITTED")
    # SUBMITTED | AUTO_CHECKED | FLAGGED | BANK_CONFIRMED | OFFICER_APPROVED

    lifecycle_status         = Column(String, default="ACTIVE")
    # ACTIVE | EXPIRING_SOON | OVERDUE | RENEWAL_SUBMITTED | RELEASE_REQUESTED
    # RELEASE_RECOMMENDED | RELEASED | ENCASHED

    flags_json               = Column(Text, default="[]")           # JSON list of flag dicts
    bbox_json                = Column(Text, default="[]")           # JSON list of bounding-box dicts
    file_sha256              = Column(String, nullable=True)
    rendered_image_path      = Column(String, nullable=True)

    bank_verify_token        = Column(String, nullable=True, unique=True)
    bank_confirmed_at        = Column(String, nullable=True)

    affidavit_6_uploaded     = Column(Boolean, default=False)
    maker_officer            = Column(String, nullable=True)
    checker_officer          = Column(String, nullable=True)

    replaced_by_fdr_id       = Column(Integer, ForeignKey("fdr_records.id"), nullable=True)
    parent_fdr_id            = Column(Integer, ForeignKey("fdr_records.id"), nullable=True)
    scrutiny_remarks         = Column(Text, nullable=True)
    clarification_requested  = Column(Boolean, default=False)

    institution = relationship("Institution", back_populates="fdrs")

    # ── helpers ─────────────────────────────
    @property
    def flags(self):
        return json.loads(self.flags_json or "[]")

    @property
    def bboxes(self):
        return json.loads(self.bbox_json or "[]")


# ─────────────────────────────────────────────
# 4.3  AuditLog — SHA-256 Hash Chain
# ─────────────────────────────────────────────
GENESIS_HASH = "0" * 64


def _compute_hash(prev_hash: str, timestamp: str, actor_role: str,
                  action: str, fdr_id: int | None, details: str) -> str:
    raw = f"{prev_hash}|{timestamp}|{actor_role}|{action}|{fdr_id}|{details}"
    return hashlib.sha256(raw.encode()).hexdigest()


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id         = Column(Integer, primary_key=True, index=True)   # block number
    timestamp  = Column(String, nullable=False)
    actor_role = Column(String, nullable=False)
    actor_name = Column(String, nullable=True)
    action     = Column(String, nullable=False)
    fdr_id     = Column(Integer, nullable=True)
    details    = Column(String, nullable=True)
    prev_hash  = Column(String, nullable=False)
    curr_hash  = Column(String, nullable=False)


def append_audit_block(
    db: Session,
    actor_role: str,
    action: str,
    details: str,
    fdr_id: int | None = None,
    actor_name: str = "SYSTEM",
    simulated_ts: str | None = None,
) -> AuditLog:
    """Append a new SHA-256 hash-chained block to the forensic ledger."""
    last = db.query(AuditLog).order_by(AuditLog.id.desc()).first()
    prev_hash = last.curr_hash if last else GENESIS_HASH
    ts = simulated_ts or datetime.now(timezone.utc).isoformat()
    curr_hash = _compute_hash(prev_hash, ts, actor_role, action, fdr_id, details)
    block = AuditLog(
        timestamp=ts,
        actor_role=actor_role,
        actor_name=actor_name,
        action=action,
        fdr_id=fdr_id,
        details=details,
        prev_hash=prev_hash,
        curr_hash=curr_hash,
    )
    db.add(block)
    db.commit()
    db.refresh(block)
    return block


# ─────────────────────────────────────────────
# 4.4  SystemConfig
# ─────────────────────────────────────────────
class SystemConfig(Base):
    __tablename__ = "system_config"

    id              = Column(Integer, primary_key=True, index=True)
    key             = Column(String, unique=True, nullable=False)
    value           = Column(String, nullable=False)


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────
def get_config(db: Session, key: str, default: str = "") -> str:
    row = db.query(SystemConfig).filter(SystemConfig.key == key).first()
    return row.value if row else default


def set_config(db: Session, key: str, value: str):
    row = db.query(SystemConfig).filter(SystemConfig.key == key).first()
    if row:
        row.value = value
    else:
        db.add(SystemConfig(key=key, value=value))
    db.commit()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    Base.metadata.create_all(bind=engine)

