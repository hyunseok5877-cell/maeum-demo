"""공통 믹스인·필드."""
from django.db import models


class TimestampedModel(models.Model):
    """모든 도메인 모델 공통: 생성·수정·소프트삭제 타임스탬프."""

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        abstract = True


def money_field(**kwargs):
    """KRW 기준 금액 필드 기본값."""
    kwargs.setdefault('max_digits', 12)
    kwargs.setdefault('decimal_places', 0)
    kwargs.setdefault('default', 0)
    return models.DecimalField(**kwargs)
