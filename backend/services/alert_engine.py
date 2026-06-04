"""Alert engine: stores UNSAFE/ALERT events and exposes them via API."""
from dataclasses import dataclass, field
from datetime import datetime
from typing import List
import threading


@dataclass
class AlertRecord:
    worker_id: int
    status: str  # "UNSAFE" | "ALERT"
    missing: List[str]
    timestamp: str  # ISO 8601


_alerts: List[AlertRecord] = []
_lock = threading.Lock()
_alert_id = 0


def _next_id() -> int:
    global _alert_id
    with _lock:
        _alert_id += 1
        return _alert_id


def push(worker_id: int, status: str, missing: List[str]) -> None:
    ts = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    with _lock:
        _alerts.append(AlertRecord(worker_id=worker_id, status=status, missing=missing or [], timestamp=ts))


def get_all() -> List[dict]:
    with _lock:
        return [
            {"worker_id": a.worker_id, "status": a.status, "missing": a.missing, "timestamp": a.timestamp}
            for a in _alerts
        ]


def clear() -> None:
    with _lock:
        _alerts.clear()
