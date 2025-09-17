"""Core package for the RentManager internal housing management tool."""

from __future__ import annotations

import sys
from typing import ForwardRef


if sys.version_info >= (3, 12) and not hasattr(ForwardRef._evaluate, "__patched__"):
    _forward_ref_evaluate = ForwardRef._evaluate

    def _patched_forward_ref_evaluate(
        self, globalns, localns, type_params=None, *, recursive_guard=None
    ):
        if recursive_guard is None:
            recursive_guard = set()
        return _forward_ref_evaluate(
            self,
            globalns,
            localns,
            type_params,
            recursive_guard=recursive_guard,
        )

    _patched_forward_ref_evaluate.__patched__ = True  # type: ignore[attr-defined]
    ForwardRef._evaluate = _patched_forward_ref_evaluate  # type: ignore[attr-defined]


from .main import create_app  # noqa: E402,F401
