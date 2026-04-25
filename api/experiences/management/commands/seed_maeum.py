"""
시드 데이터 투입: `python manage.py seed_maeum`

Phase 1 런칭 전 데모·개발용 최소 데이터셋.
- 국가 4개 (한국만 active)
- 지역 8개 (한국 서울·부산·제주·강원·경기·전남·경북·인천)
- 카테고리 3개 (슈퍼카·요트·외승)
- 태그 6개
- 벤더 3개
- 멤버십 티어 3개 (Phase 1은 UI 비활성, DB만)
- 성향 유형 4개 샘플
- 경험 6개 (서울 2 · 부산 2 · 제주 2)
"""
from datetime import date
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from experiences.models import (
    Country, Region, Category, Tag, Vendor, VendorContract,
    Experience, ExperienceMedia, ExperienceOption,
)
from accounts.models import MembershipTier
from curation.models import PersonalityType


COUNTRIES = [
    {'code': 'KR', 'name_ko': '한국', 'name_en': 'Korea', 'is_active': True, 'display_order': 1},
    {'code': 'JP', 'name_ko': '일본', 'name_en': 'Japan', 'is_active': False, 'display_order': 2},
    {'code': 'CN', 'name_ko': '중국', 'name_en': 'China', 'is_active': False, 'display_order': 3},
    {'code': 'US', 'name_ko': '미국', 'name_en': 'United States', 'is_active': False, 'display_order': 4},
    {'code': 'FR', 'name_ko': '프랑스', 'name_en': 'France', 'is_active': False, 'display_order': 5},
    {'code': 'IT', 'name_ko': '이탈리아', 'name_en': 'Italy', 'is_active': False, 'display_order': 6},
]

REGIONS = [
    {'code': 'seoul', 'name_ko': '서울', 'name_en': 'Seoul', 'lat': 37.5665, 'lng': 126.9780, 'display_order': 1},
    {'code': 'busan', 'name_ko': '부산', 'name_en': 'Busan', 'lat': 35.1796, 'lng': 129.0756, 'display_order': 2},
    {'code': 'jeju', 'name_ko': '제주', 'name_en': 'Jeju', 'lat': 33.4996, 'lng': 126.5312, 'display_order': 3},
    {'code': 'gangwon', 'name_ko': '강원', 'name_en': 'Gangwon', 'lat': 37.8228, 'lng': 128.1555, 'display_order': 4},
    {'code': 'gyeonggi', 'name_ko': '경기', 'name_en': 'Gyeonggi', 'lat': 37.4138, 'lng': 127.5183, 'display_order': 5},
    {'code': 'jeonnam', 'name_ko': '전남', 'name_en': 'Jeonnam', 'lat': 34.8679, 'lng': 126.9910, 'display_order': 6},
    {'code': 'gyeongbuk', 'name_ko': '경북', 'name_en': 'Gyeongbuk', 'lat': 36.4919, 'lng': 128.8889, 'display_order': 7},
    {'code': 'incheon', 'name_ko': '인천', 'name_en': 'Incheon', 'lat': 37.4563, 'lng': 126.7052, 'display_order': 8},
]

CATEGORIES = [
    {'code': 'supercar', 'name_ko': '슈퍼카', 'name_en': 'Supercar', 'icon': 'car', 'display_order': 1,
     'description': '람보르기니·페라리·맥라렌 등 프리미엄 드라이브 세션.'},
    {'code': 'yacht', 'name_ko': '요트', 'name_en': 'Yacht', 'icon': 'anchor', 'display_order': 2,
     'description': '프라이빗 요트 차터 · 선셋 · 디너.'},
    {'code': 'equestrian', 'name_ko': '프라이빗 외승', 'name_en': 'Private Equestrian', 'icon': 'horse', 'display_order': 3,
     'description': '자연 속 프리미엄 야외 승마 세션.'},
    {'code': 'kpop', 'name_ko': 'K-pop 컬처', 'name_en': 'K-pop Culture', 'icon': 'music', 'display_order': 4,
     'description': '한국 엔터테인먼트 산업의 현장 — 스튜디오·레코딩·안무 세션.'},
    {'code': 'sports', 'name_ko': '스포츠', 'name_en': 'Sports', 'icon': 'trophy', 'display_order': 5,
     'description': '프라이빗 레슨·관람·투어링 — 골프·테니스·서핑 중심.'},
    {'code': 'drive', 'name_ko': '드라이브', 'name_en': 'Scenic Drive', 'icon': 'road', 'display_order': 6,
     'description': '라이프스타일 드라이브 — 루트 큐레이션과 사진 포인트 포함.'},
    {'code': 'food', 'name_ko': '음식', 'name_en': 'Gastronomy', 'icon': 'utensils', 'display_order': 7,
     'description': '프라이빗 다이닝·파인 쿠킹 클래스·셰프 동행 마켓 투어링.'},
]

TAGS = [
    {'code': 'luxury', 'name_ko': '럭셔리'},
    {'code': 'thrill', 'name_ko': '짜릿함'},
    {'code': 'romance', 'name_ko': '로맨틱'},
    {'code': 'healing', 'name_ko': '힐링'},
    {'code': 'sunset', 'name_ko': '선셋'},
    {'code': 'private', 'name_ko': '프라이빗'},
]

VENDORS = [
    {'name': '서울 프리미엄 오토', 'phone': '02-000-0001', 'email': 'ops@seoul-premium-auto.example',
     'address': '서울 강남구', 'status': 'active', 'commission_rate': Decimal('25.00')},
    {'name': '부산 블루 마리나', 'phone': '051-000-0002', 'email': 'ops@busan-blue-marina.example',
     'address': '부산 해운대구', 'status': 'active', 'commission_rate': Decimal('22.00')},
    {'name': '제주 승마 리트릿', 'phone': '064-000-0003', 'email': 'ops@jeju-equestrian.example',
     'address': '제주시', 'status': 'active', 'commission_rate': Decimal('30.00')},
    {'name': '서울 스튜디오 시그널', 'phone': '02-000-0004', 'email': 'ops@seoul-studio-signal.example',
     'address': '서울 강남구 · 성수동', 'status': 'active', 'commission_rate': Decimal('28.00')},
]

MEMBERSHIP_TIERS = [
    {'code': 'standard', 'name': 'Standard', 'annual_fee': 0, 'priority_queue_weight': 0,
     'benefits': ['기본 경험 예약', '성향 테스트']},
    {'code': 'gold', 'name': 'Gold', 'annual_fee': 1_000_000, 'priority_queue_weight': 10,
     'benefits': ['우선 예약', '경험 5~10% 할인', '월 1회 시크릿 경험 초대']},
    {'code': 'black', 'name': 'Black', 'annual_fee': 5_000_000, 'priority_queue_weight': 100,
     'benefits': ['전담 큐레이터', '경험 15% 할인', '비공개 경험 접근', '동반 1인 무료']},
]

PERSONALITY_TYPES = [
    {
        'code': 'NOCTURNE_LUXE',
        'name_ko': '야행성 럭셔리파',
        'name_en': 'Nocturne Luxe',
        'description': (
            '해가 진 뒤 빛나는 도시에서 당신의 밤을 설계하는 사람. '
            '낮의 분주함보다 야경·조도·정적이 흐르는 공간에서 진짜 자기다움을 느끼는군요. '
            '대중적 핫플레이스보다 비공개·예약제·소수만 아는 곳을 선호하고, '
            '돈보다는 분위기와 디테일 — 누가 함께였는지, 그날 음악이 무엇이었는지 — 가 더 오래 남는 가치라고 믿습니다. '
            '즉흥적인 자유로움보다는 미리 그려둔 동선 안에서 자유롭고 싶은, '
            '계획적 큐레이션을 좋아하는 분이에요. '
            '도시 야경 드라이브·심야 요트·프라이빗 라운지·시그니처 디너에 강점이 있고, '
            '조용히 빛나는 비공개 경험을 좋아하시니 아래와 같은 큐레이션을 추천드립니다.'
        ),
    },
    {
        'code': 'DAWN_HEAL',
        'name_ko': '새벽의 정원사',
        'name_en': 'Dawn Healer',
        'description': (
            '고요한 아침, 자연이 먼저 깨어나는 순간을 선호하는 사람. '
            '시끄러운 자극보다 호흡이 깊어지는 시간 속에서 자신을 회복하는 분이에요. '
            '소비 그 자체보다 마음의 평정·관계의 깊이·자연과의 연결을 더 큰 가치로 여기고, '
            '한 번에 많은 일정을 욱여넣기보다 하나의 순간을 충분히 머물러 음미하는 계획적인 여유를 좋아합니다. '
            '외승·해변 산책·요가·온천·시그니처 티 세션에 강점이 있고, '
            '아침의 결을 살리는 차분한 큐레이션을 선호하시니 아래와 같은 경험을 추천드립니다.'
        ),
    },
    {
        'code': 'THRILL_RIDER',
        'name_ko': '드라이브 스릴 시커',
        'name_en': 'Thrill Rider',
        'description': (
            '속도와 몰입이 주는 아드레날린 — 짜릿한 몇 시간의 지배자. '
            '안락한 정적보다 심장이 뛰는 강렬한 자극에서 가장 자기다움을 느끼는 분이에요. '
            '돈보다는 그 순간의 강도와 진짜 경험만이 줄 수 있는 감각의 가치를 우선합니다. '
            '계획을 짜되 그 안에서 즉흥적 변주와 도전을 즐기는 균형형. '
            '슈퍼카 트랙·서킷 드라이빙·요트 스피드 세션·헬리콥터 투어에 강점이 있고, '
            '강렬한 몰입을 좋아하시니 아래와 같은 큐레이션을 추천드립니다.'
        ),
    },
    {
        'code': 'ROMANCE_ARCHITECT',
        'name_ko': '로맨스 설계자',
        'name_en': 'Romance Architect',
        'description': (
            '특별한 사람과 단 한 번뿐인 순간을 연출하고 싶은 사람. '
            '로맨스를 중시하고 관계의 깊이와 정서적 의미를 가장 큰 가치로 여기는 분이에요. '
            '돈보다는 가치를 — 그 사람이 평생 기억할 한 장면을 만드는 일에 자원을 쓰는 것을 아끼지 않습니다. '
            '즉흥적인 것보다는 디테일을 미리 설계하는 계획적 로맨티스트. '
            '선셋 프라이빗 요트·프로포즈 디너·남산 야경 드라이브·해변 외승 등 '
            '두 사람만의 무대를 연출하는 데 강점이 있고, '
            '의미 있는 한 장면을 디자인하는 큐레이션을 좋아하시니 아래와 같은 경험을 추천드립니다.'
        ),
    },
]

EXPERIENCES = [
    # 서울 슈퍼카
    {
        'slug': 'lamborghini-seoul-urban-drive',
        'title_ko': '람보르기니 서울 도심 드라이브',
        'title_en': 'Lamborghini Seoul Urban Drive',
        'subtitle_ko': '강남에서 한남까지, 도시의 심장을 지나는 두 시간',
        'description_ko': '검정 람보르기니 우라칸 또는 우라칸 스파이더로 강남 · 한남 · 남산을 순회하는 프라이빗 드라이빙 세션. 인증 드라이버 옵션 포함. 촬영 옵션 선택 가능.',
        'region_code': 'seoul', 'category_code': 'supercar', 'vendor_name': '서울 프리미엄 오토',
        'base_price': 2_800_000, 'duration_minutes': 120, 'min_pax': 1, 'max_pax': 2,
        'is_featured': True, 'is_monthly_popular': True, 'home_pick_order': 2,
        'tag_codes': ['luxury', 'thrill', 'private'],
    },
    {
        'slug': 'ferrari-sunset-namsan',
        'title_ko': '페라리 선셋 남산 루트',
        'title_en': 'Ferrari Sunset Namsan Route',
        'subtitle_ko': '해가 도시를 물들이는 시간에 도시를 가로지르는 붉은 경험',
        'description_ko': '페라리 로마 혹은 포르토피노로 선셋 타이밍에 한남–남산–동작대교–반포대교를 순회합니다. 포토그래퍼 동행 옵션.',
        'region_code': 'seoul', 'category_code': 'supercar', 'vendor_name': '서울 프리미엄 오토',
        'base_price': 3_200_000, 'duration_minutes': 150, 'min_pax': 1, 'max_pax': 2,
        'is_featured': True, 'is_monthly_popular': True, 'home_pick_order': 1,
        'tag_codes': ['luxury', 'sunset', 'thrill'],
    },

    # 부산 요트
    {
        'slug': 'busan-haeundae-private-yacht-sunset',
        'title_ko': '해운대 프라이빗 요트 선셋',
        'title_en': 'Haeundae Private Yacht Sunset',
        'subtitle_ko': '해운대 앞바다에서 광안대교 위 노을을 마주하다',
        'description_ko': '해운대 수영만에서 출항해 광안대교 루트로 선셋 차터. 샴페인 1병 포함, 식사 업그레이드 가능.',
        'region_code': 'busan', 'category_code': 'yacht', 'vendor_name': '부산 블루 마리나',
        'base_price': 2_400_000, 'duration_minutes': 180, 'min_pax': 2, 'max_pax': 8,
        'is_featured': True, 'is_new_arrival': True, 'home_pick_order': 3,
        'tag_codes': ['luxury', 'sunset', 'romance'],
    },
    {
        'slug': 'busan-night-yacht-champagne',
        'title_ko': '부산 심야 요트 & 샴페인',
        'title_en': 'Busan Night Yacht & Champagne',
        'subtitle_ko': '광안대교 조명이 바다 위로 쏟아지는 시간',
        'description_ko': '야간 차터. 보조 셰프 옵션으로 간단한 카나페 서비스. 블랙타이 드레스코드 권장.',
        'region_code': 'busan', 'category_code': 'yacht', 'vendor_name': '부산 블루 마리나',
        'base_price': 2_900_000, 'duration_minutes': 150, 'min_pax': 2, 'max_pax': 6,
        'is_monthly_popular': True, 'is_new_arrival': True,
        'tag_codes': ['luxury', 'private', 'romance'],
    },

    # 서울 K-pop
    {
        'slug': 'kpop-seoul-private-studio-session',
        'title_ko': 'K-pop 서울 프라이빗 스튜디오 세션',
        'title_en': 'K-pop Seoul Private Studio Session',
        'subtitle_ko': '레코딩 · 안무 · 스타일링 — 하루 동안 아이돌의 리듬을',
        'description_ko': '현역 K-pop 프로듀서·안무가와 함께하는 프라이빗 세션. 강남 녹음 스튜디오에서 나만의 한 트랙 레코딩, 성수동 댄스 스튜디오에서 안무 클래스, 메이크업·스타일링·프로 촬영까지 풀패키지.',
        'region_code': 'seoul', 'category_code': 'kpop', 'vendor_name': '서울 스튜디오 시그널',
        'base_price': 3_500_000, 'duration_minutes': 360, 'min_pax': 1, 'max_pax': 4,
        'is_featured': True, 'is_monthly_popular': True,
        'tag_codes': ['luxury', 'private'],
    },

    # 제주 외승
    {
        'slug': 'jeju-private-equestrian-oreum',
        'title_ko': '제주 오름 프라이빗 외승',
        'title_en': 'Jeju Oreum Private Equestrian',
        'subtitle_ko': '제주 오름의 능선 위에서 만나는 말의 호흡',
        'description_ko': '초중급자 전용. 프라이빗 인스트럭터 1:1, 드레스 · 헬멧 제공. 오름 능선 외승 + 쉼터 티 세션.',
        'region_code': 'jeju', 'category_code': 'equestrian', 'vendor_name': '제주 승마 리트릿',
        'base_price': 1_800_000, 'duration_minutes': 180, 'min_pax': 1, 'max_pax': 2,
        'is_featured': True, 'is_new_arrival': True,
        'tag_codes': ['healing', 'private'],
    },
    {
        'slug': 'jeju-beach-equestrian-sunset',
        'title_ko': '제주 바닷가 선셋 외승',
        'title_en': 'Jeju Beach Sunset Equestrian',
        'subtitle_ko': '해가 바다로 내려앉는 순간, 파도 옆의 말 걸음',
        'description_ko': '중급자 이상 권장. 제주 서쪽 해변에서 선셋 시간대에 진행되는 외승. 개인 포토 세션 포함.',
        'region_code': 'jeju', 'category_code': 'equestrian', 'vendor_name': '제주 승마 리트릿',
        'base_price': 2_200_000, 'duration_minutes': 180, 'min_pax': 1, 'max_pax': 2,
        'is_monthly_popular': True,
        'tag_codes': ['sunset', 'romance', 'healing'],
    },
]


class Command(BaseCommand):
    help = '마음 플랫폼 시드 데이터 (국가·지역·카테고리·벤더·경험·멤버십·성향) 투입'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true',
                            help='기존 시드 데이터 삭제 후 재투입 (주의: 경험/벤더 삭제)')

    @transaction.atomic
    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write(self.style.WARNING('Resetting seed data...'))
            Experience.objects.all().delete()
            Vendor.objects.all().delete()

        self._seed_countries()
        self._seed_regions()
        self._seed_categories()
        self._seed_tags()
        self._seed_membership_tiers()
        self._seed_personality_types()
        self._seed_vendors_and_contracts()
        self._seed_experiences()

        self.stdout.write(self.style.SUCCESS('\n✅ 시드 완료:'))
        self.stdout.write(f'  • 국가 {Country.objects.count()}개')
        self.stdout.write(f'  • 지역 {Region.objects.count()}개')
        self.stdout.write(f'  • 카테고리 {Category.objects.count()}개')
        self.stdout.write(f'  • 태그 {Tag.objects.count()}개')
        self.stdout.write(f'  • 벤더 {Vendor.objects.count()}개')
        self.stdout.write(f'  • 멤버십 티어 {MembershipTier.objects.count()}개 (Phase 1 UI 비활성)')
        self.stdout.write(f'  • 성향 유형 {PersonalityType.objects.count()}개')
        self.stdout.write(f'  • 경험 {Experience.objects.count()}개')

    def _seed_countries(self):
        for c in COUNTRIES:
            Country.objects.update_or_create(code=c['code'], defaults=c)

    def _seed_regions(self):
        kr = Country.objects.get(code='KR')
        for r in REGIONS:
            Region.objects.update_or_create(country=kr, code=r['code'], defaults={**r, 'country': kr})

    def _seed_categories(self):
        for c in CATEGORIES:
            Category.objects.update_or_create(code=c['code'], defaults=c)

    def _seed_tags(self):
        for t in TAGS:
            Tag.objects.update_or_create(code=t['code'], defaults=t)

    def _seed_membership_tiers(self):
        for t in MEMBERSHIP_TIERS:
            MembershipTier.objects.update_or_create(code=t['code'], defaults=t)

    def _seed_personality_types(self):
        for p in PERSONALITY_TYPES:
            PersonalityType.objects.update_or_create(code=p['code'], defaults=p)

    def _seed_vendors_and_contracts(self):
        for v in VENDORS:
            vendor, _ = Vendor.objects.update_or_create(
                name=v['name'],
                defaults={k: v[k] for k in ['phone', 'email', 'address', 'status']},
            )
            VendorContract.objects.update_or_create(
                vendor=vendor, commission_rate=v['commission_rate'],
                defaults={'contract_start': date.today(), 'settlement_cycle': 'monthly'},
            )

    def _seed_experiences(self):
        kr = Country.objects.get(code='KR')
        for e in EXPERIENCES:
            region = Region.objects.get(country=kr, code=e['region_code'])
            category = Category.objects.get(code=e['category_code'])
            vendor = Vendor.objects.get(name=e['vendor_name'])
            tag_codes = e.pop('tag_codes', [])
            region_code = e.pop('region_code')
            category_code = e.pop('category_code')
            vendor_name = e.pop('vendor_name')

            exp, _ = Experience.objects.update_or_create(
                slug=e['slug'],
                defaults={
                    **e,
                    'country': kr,
                    'region': region,
                    'category': category,
                    'vendor': vendor,
                    'status': 'active',
                    'published_at': timezone.now(),
                },
            )
            if tag_codes:
                exp.tags.set(Tag.objects.filter(code__in=tag_codes))
            # 대표 이미지 1장 더미 (Unsplash)
            if not exp.media.exists():
                ExperienceMedia.objects.create(
                    experience=exp,
                    type='image',
                    url=f'https://source.unsplash.com/1600x900/?{category.name_en.lower()},luxury',
                    display_order=0,
                    alt_text=exp.title_ko,
                    is_cover=True,
                )
