"""Analytics: total_workers, safe_count, unsafe_count, alerts_count."""
import threading

_total_workers = 0
_safe_count = 0
_unsafe_count = 0
_alerts_count = 0
_lock = threading.Lock()


def update(total: int, safe: int, unsafe: int, alerts: int) -> None:
    with _lock:
        global _total_workers, _safe_count, _unsafe_count, _alerts_count
        _total_workers = total
        _safe_count = safe
        _unsafe_count = unsafe
        _alerts_count = alerts


def get() -> dict:
    with _lock:
        total = _total_workers
        safe = _safe_count
        unsafe = _unsafe_count
        alerts = _alerts_count
    return {
        "total_workers": total,
        "safe_count": safe,
        "unsafe_count": unsafe,
        "alerts_count": alerts,
        "violation_rate": (unsafe / total) if total else 0.0,
    }
