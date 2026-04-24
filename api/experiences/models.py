"""experiences — 국가·지역·카테고리·경험·벤더·미디어·옵션·스케줄·임베딩·태그."""
from django.db import models
from maeum.common import TimestampedModel, money_field


class Country(TimestampedModel):
    """국가 마스터. Phase 1: 한국만 active, 나머지 Coming Soon."""

    code = models.CharField(max_length=2, unique=True, help_text='ISO 3166-1 alpha-2')
    name_ko = models.CharField(max_length=50)
    name_en = models.CharField(max_length=50)
    is_active = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)

    class Meta:
        verbose_name = '국가'
        verbose_name_plural = '국가'
        ordering = ['display_order', 'code']

    def __str__(self):
        return f'{self.name_ko} ({self.code})'


class Region(TimestampedModel):
    """국가 내 지역 (구글맵 좌표 포함)."""

    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='regions')
    code = models.CharField(max_length=20)
    name_ko = models.CharField(max_length=50)
    name_en = models.CharField(max_length=50)
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    bounding_box = models.JSONField(null=True, blank=True, help_text='{"sw":[lat,lng], "ne":[lat,lng]}')
    hero_media = models.ForeignKey(
        'ExperienceMedia', on_delete=models.SET_NULL, null=True, blank=True, related_name='+'
    )
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)

    class Meta:
        verbose_name = '지역'
        verbose_name_plural = '지역'
        unique_together = [('country', 'code')]
        ordering = ['display_order', 'code']

    def __str__(self):
        return f'{self.country.code}/{self.name_ko}'


class Category(TimestampedModel):
    """경험 대분류. Phase 1: supercar, yacht, equestrian."""

    code = models.CharField(max_length=30, unique=True)
    name_ko = models.CharField(max_length=50)
    name_en = models.CharField(max_length=50)
    icon = models.CharField(max_length=50, blank=True, default='')
    description = models.TextField(blank=True, default='')
    display_order = models.IntegerField(default=0)

    class Meta:
        verbose_name = '카테고리'
        verbose_name_plural = '카테고리'
        ordering = ['display_order', 'code']

    def __str__(self):
        return self.name_ko


class Tag(TimestampedModel):
    """경험 성향 태그 (추천 엔진용)."""

    code = models.CharField(max_length=30, unique=True)
    name_ko = models.CharField(max_length=50)

    class Meta:
        verbose_name = '태그'
        verbose_name_plural = '태그'

    def __str__(self):
        return self.name_ko


class Vendor(TimestampedModel):
    """제휴 공급사."""

    STATUS_CHOICES = [
        ('active', '활성'),
        ('paused', '일시중단'),
        ('blacklisted', '차단'),
    ]

    name = models.CharField(max_length=200)
    contact_name = models.CharField(max_length=100, blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    business_registration_no = models.CharField(max_length=20, blank=True, default='')
    address = models.CharField(max_length=300, blank=True, default='')
    insurance_info = models.JSONField(default=dict, blank=True)
    bank_account = models.CharField(max_length=200, blank=True, default='', help_text='암호화 대상')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    class Meta:
        verbose_name = '공급사 (벤더)'
        verbose_name_plural = '공급사 (벤더)'

    def __str__(self):
        return self.name


class VendorContract(TimestampedModel):
    """벤더 계약(정산율·주기)."""

    SETTLEMENT_CYCLES = [
        ('weekly', '주간'),
        ('monthly', '월간'),
    ]

    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='contracts')
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, help_text='예: 25.00')
    settlement_cycle = models.CharField(max_length=10, choices=SETTLEMENT_CYCLES, default='monthly')
    contract_start = models.DateField()
    contract_end = models.DateField(null=True, blank=True)
    contract_pdf_url = models.URLField(blank=True, default='')

    class Meta:
        verbose_name = '공급사 계약'
        verbose_name_plural = '공급사 계약'

    def __str__(self):
        return f'{self.vendor} {self.commission_rate}%'


class VendorDocument(TimestampedModel):
    """벤더 증빙 파일 (사업자등록·보험·계약)."""

    TYPE_CHOICES = [
        ('business_reg', '사업자등록증'),
        ('insurance', '보험증권'),
        ('contract', '계약서'),
        ('driver_license', '운전·조종면허'),
        ('safety_cert', '안전 인증'),
    ]

    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='documents')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    file_url = models.URLField()
    valid_until = models.DateField(null=True, blank=True)
    verified_by = models.ForeignKey(
        'accounts.Curator', on_delete=models.SET_NULL, null=True, blank=True, related_name='+'
    )
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = '공급사 증빙 파일'
        verbose_name_plural = '공급사 증빙 파일'

    def __str__(self):
        return f'{self.vendor} {self.get_type_display()}'


class Experience(TimestampedModel):
    """경험 상품 (3-depth 노출 단위)."""

    STATUS_CHOICES = [
        ('draft', '초안'),
        ('active', '공개'),
        ('paused', '일시중지'),
        ('archived', '보관'),
    ]

    slug = models.SlugField(max_length=200, unique=True)
    title_ko = models.CharField('상품명 (한)', max_length=200)
    title_en = models.CharField('상품명 (영)', max_length=200, blank=True, default='')
    subtitle_ko = models.CharField(max_length=300, blank=True, default='')
    subtitle_en = models.CharField(max_length=300, blank=True, default='')
    description_ko = models.TextField('짧은 설명', blank=True, default='', help_text='리스트·카드 노출용 요약')
    description_en = models.TextField(blank=True, default='')
    content_html = models.TextField(
        '상세 콘텐츠 (리치텍스트)', blank=True, default='',
        help_text='네이버 블로그 스타일 에디터로 작성 — 글꼴·색·줄긋기·이미지·링크 자유롭게',
    )

    country = models.ForeignKey(Country, on_delete=models.PROTECT, related_name='experiences')
    region = models.ForeignKey(Region, on_delete=models.PROTECT, related_name='experiences')
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='experiences')
    vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, blank=True, related_name='experiences')

    base_price = money_field(verbose_name='정가 (KRW)')
    discount_percentage = models.IntegerField(
        '할인 %', default=0,
        help_text='0~100. 설정 시 프론트에서 원가에 짝대기 + 할인가 노출',
    )
    currency = models.CharField(max_length=3, default='KRW')
    duration_minutes = models.IntegerField('소요시간(분)', default=0)
    min_pax = models.IntegerField(default=1)
    max_pax = models.IntegerField(default=4)
    advance_booking_days = models.IntegerField(default=3)
    cancellation_policy = models.TextField(blank=True, default='')

    # 상품 가능 일자 (특정 기간만 운영할 때). null이면 상시.
    available_from = models.DateField('가능일 시작', null=True, blank=True)
    available_to = models.DateField('가능일 종료', null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False)
    rating_avg = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    rating_count = models.IntegerField(default=0)
    views_count = models.IntegerField(default=0)
    booking_count = models.IntegerField(default=0)

    seo_meta_title = models.CharField(max_length=200, blank=True, default='')
    seo_meta_description = models.CharField(max_length=300, blank=True, default='')

    tags = models.ManyToManyField(Tag, blank=True, related_name='experiences')
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = '경험 상품'
        verbose_name_plural = '경험 상품'
        indexes = [
            models.Index(fields=['country', 'region', 'status']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['is_featured', 'status']),
            models.Index(fields=['-published_at']),
        ]
        ordering = ['-is_featured', '-published_at']

    def __str__(self):
        return self.title_ko

    @property
    def final_price(self):
        """할인 반영 최종 가격 (정수 KRW)."""
        from decimal import Decimal
        if not self.discount_percentage:
            return self.base_price
        disc = Decimal(self.base_price) * Decimal(100 - self.discount_percentage) / Decimal(100)
        return int(disc)

    @property
    def discount_amount(self):
        from decimal import Decimal
        if not self.discount_percentage:
            return 0
        return int(Decimal(self.base_price) - Decimal(self.final_price))


def experience_file_upload_path(instance, filename):
    """업로드 파일 경로: media/experiences/<slug>/<filename>"""
    import os
    base = os.path.basename(filename)
    return f'experiences/{instance.experience.slug}/{base}'


class ExperienceMedia(TimestampedModel):
    """경험 이미지·영상·문서. JPG/PNG/GIF/WEBP/MP4/PDF 업로드 가능."""

    TYPE_CHOICES = [
        ('image', '이미지'),
        ('video', '영상'),
        ('document', '문서'),
    ]
    ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'mp4', 'mov', 'webm', 'pdf']

    experience = models.ForeignKey(Experience, on_delete=models.CASCADE, related_name='media')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='image')
    file = models.FileField(
        '파일 업로드', upload_to=experience_file_upload_path, null=True, blank=True,
        help_text='JPG · PNG · GIF · WEBP · MP4 · PDF 등. 외부 URL만 쓸 경우 비워도 됨.',
    )
    url = models.URLField('외부 URL', blank=True, default='', help_text='업로드 대신 외부 이미지 URL 사용 시')
    display_order = models.IntegerField(default=0)
    alt_text = models.CharField(max_length=300, blank=True, default='', help_text='접근성 대체 텍스트')
    is_cover = models.BooleanField('대표 이미지', default=False)

    class Meta:
        verbose_name = '경험 이미지·영상'
        verbose_name_plural = '경험 이미지·영상'
        ordering = ['display_order']

    def __str__(self):
        return f'{self.experience} · {self.type}'

    @property
    def src(self):
        """프론트 렌더링용 최종 소스 URL."""
        if self.file:
            return self.file.url
        return self.url


class ExperienceOption(TimestampedModel):
    """경험 옵션 (업그레이드·추가 서비스)."""

    experience = models.ForeignKey(Experience, on_delete=models.CASCADE, related_name='options')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    additional_price = money_field()
    max_quantity = models.IntegerField(default=1)

    class Meta:
        verbose_name = '경험 옵션'
        verbose_name_plural = '경험 옵션'

    def __str__(self):
        return f'{self.experience} + {self.name}'


class ExperienceSchedule(TimestampedModel):
    """운영 가능 일자·시간대 슬롯."""

    experience = models.ForeignKey(Experience, on_delete=models.CASCADE, related_name='schedules')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    capacity = models.IntegerField(default=1)
    is_blocked = models.BooleanField(default=False)

    class Meta:
        verbose_name = '경험 일정 슬롯'
        verbose_name_plural = '경험 일정 슬롯'
        unique_together = [('experience', 'date', 'start_time')]
        ordering = ['date', 'start_time']

    def __str__(self):
        return f'{self.experience} {self.date} {self.start_time}'


class ExperienceEmbedding(TimestampedModel):
    """RAG 검색용 벡터 임베딩 (pgvector 전환 시 embedding 필드 VectorField로 교체)."""

    experience = models.OneToOneField(Experience, on_delete=models.CASCADE, related_name='embedding')
    content_hash = models.CharField(max_length=64)
    embedding = models.JSONField(null=True, blank=True)
    model_version = models.CharField(max_length=50, default='text-embedding-3-large')

    class Meta:
        verbose_name = '경험 임베딩 (RAG)'
        verbose_name_plural = '경험 임베딩 (RAG)'

    def __str__(self):
        return f'embed<{self.experience}>'
