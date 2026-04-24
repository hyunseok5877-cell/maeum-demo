from rest_framework import serializers
from .models import PersonalityType, PersonalityTestSession, CurationRequest
from experiences.serializers import ExperienceListSerializer


class PersonalityTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalityType
        fields = ('code', 'name_ko', 'name_en', 'description', 'image_url')


class QuizResultSerializer(serializers.ModelSerializer):
    result_type = PersonalityTypeSerializer(read_only=True)
    recommended_experiences = serializers.SerializerMethodField()

    class Meta:
        model = PersonalityTestSession
        fields = ('session_token', 'completed_at', 'result_type', 'recommended_experiences')

    def get_recommended_experiences(self, obj):
        """유형 기반 추천 — hero_experiences 우선, 부족하면 featured로 보충."""
        from experiences.models import Experience

        qs = []
        if obj.result_type:
            qs = list(obj.result_type.hero_experiences.filter(status='active')[:3])
        if len(qs) < 3:
            need = 3 - len(qs)
            extra = Experience.objects.filter(status='active', is_featured=True).exclude(
                id__in=[e.id for e in qs]
            )[:need]
            qs.extend(extra)
        return ExperienceListSerializer(qs, many=True, context=self.context).data


class CurationRequestCreateSerializer(serializers.ModelSerializer):
    """게스트·회원 모두 가능한 역제안 문의 접수."""

    class Meta:
        model = CurationRequest
        fields = (
            'id',
            'guest_name', 'guest_phone', 'guest_email',
            'preferred_date_start', 'preferred_date_end',
            'region', 'budget_min', 'budget_max',
            'pax_count', 'occasion', 'personality_type',
            'free_text', 'source',
        )
        read_only_fields = ('id',)

    def validate(self, attrs):
        # 비회원이면 이메일·전화 중 최소 하나 필수
        user = self.context['request'].user if 'request' in self.context else None
        if not (user and user.is_authenticated):
            if not attrs.get('guest_email') and not attrs.get('guest_phone'):
                raise serializers.ValidationError('이메일 또는 전화번호 중 하나는 필수입니다.')
            if not attrs.get('guest_name'):
                raise serializers.ValidationError('성함을 입력해주세요.')
        return attrs
