import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ViewTransition, startViewTransition } from './ui/ViewTransition';
import { GlassCard } from './ui/GlassCard';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import SpaRoundedIcon from '@mui/icons-material/SpaRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { clsx } from 'clsx';

export interface ProductItem {
  id: string;
  titleFa: string;
  titleEn: string;
  categoryFa: string;
  categoryEn: string;
  price: string;
  descriptionFa: string;
  descriptionEn: string;
  featuresFa: string[];
  featuresEn: string[];
  icon: React.ReactNode;
  accentBg: string;
  tag: string;
}

const SAMPLE_PRODUCTS: ProductItem[] = [
  {
    id: 'deep-focus-kit',
    titleFa: 'بسته تمرکز عمیق (Deep Focus Kit)',
    titleEn: 'Deep Focus Kit Pro',
    categoryFa: 'تجهیزات تمرکز',
    categoryEn: 'Focus Gear',
    price: '۲,۴۵۰,۰۰۰ تومان',
    descriptionFa: 'پکیج مهندسی تمرکز با تایمر شیشه‌ای پومودورو، دفترچه ثبت تخته‌سنگ روزانه و مسدودکننده اصطکاک ۱۰ ثانیه‌ای حواس‌پرتی.',
    descriptionEn: 'Engineered focus workstation bundle with minimal liquid glass Pomodoro timer, daily boulder journal, and friction delay tracker.',
    featuresFa: ['تایمر شیشه‌ای اختصاصی', 'دفترچه کالیبراسیون سنگ‌ریزه', 'عضویت باشگاه فوکوس'],
    featuresEn: ['Dedicated glass timer', 'Boulder calibration journal', 'Focus club membership'],
    icon: <TimerOutlinedIcon sx={{ fontSize: 32 }} />,
    accentBg: 'from-amber-500/20 to-orange-500/10',
    tag: 'پرفروش‌ترین',
  },
  {
    id: 'boulder-stone',
    titleFa: 'سنگ تخته‌سنگ رومیزی (The Boulder)',
    titleEn: 'The Desk Boulder Stone',
    categoryFa: 'یادآور فیزیکی',
    categoryEn: 'Physical Anchor',
    price: '۱,۱۸۰,۰۰۰ تومان',
    descriptionFa: 'سنگ بازالت طبیعی پولیش‌شده با حک لیزری متدولوژی تک‌نقطه برای قرار دادن روی میز تا اتمام مهم‌ترین تسک روز.',
    descriptionEn: 'Natural polished basalt stone engraved with the Boulder Method to physically anchor your daily priority on your desk.',
    featuresFa: ['سنگ بازالت طبیعی دست‌ساز', 'پایه چوب گردو', 'کارت یادآور قانون ۱۰ ثانیه'],
    featuresEn: ['Handcrafted natural basalt', 'Walnut wood base', '10-Second rule anchor card'],
    icon: <LocalFireDepartmentRoundedIcon sx={{ fontSize: 32 }} />,
    accentBg: 'from-emerald-500/20 to-teal-500/10',
    tag: 'محبوب',
  },
  {
    id: 'mindful-leisure',
    titleFa: 'کیت تفریح بدون عذاب وجدان',
    titleEn: 'Mindful Play Ritual Box',
    categoryFa: 'تعادل زیستی',
    categoryEn: 'Life Balance',
    price: '۱,۶۵۰,۰۰۰ تومان',
    descriptionFa: 'مجموعه بازی‌های ذهن‌آگاهی و بازدارنده سندروم فرسودگی شغلی، طراحی شده برای فعال‌سازی سیستم پاداش دوپامین سالم.',
    descriptionEn: 'Mindfulness puzzle kit designed to activate healthy dopamine recharge intervals without guilt or productivity anxiety.',
    featuresFa: ['پازل چوبی ارگونومیک', 'کارت‌های تنفس ۴-۷-۸', 'چای ریلکسیشن گیاهی'],
    featuresEn: ['Ergonomic wooden puzzle', '4-7-8 Breathing cards', 'Organic herbal blend'],
    icon: <SpaRoundedIcon sx={{ fontSize: 32 }} />,
    accentBg: 'from-indigo-500/20 to-blue-500/10',
    tag: 'جدید',
  },
];

export const ProductCardDetailTransition: React.FC = () => {
  const { i18n } = useTranslation();
  const isFa = i18n.language === 'fa';
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  const handleSelectProduct = (product: ProductItem) => {
    startViewTransition(() => {
      setSelectedProduct(product);
    }, ['nav-forward']);
  };

  const handleBackToList = () => {
    startViewTransition(() => {
      setSelectedProduct(null);
    }, ['nav-back']);
  };

  const BackIcon = isFa ? ArrowForwardRoundedIcon : ArrowBackRoundedIcon;

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4">
      {/* ================= VIEW 1: PRODUCT DETAIL VIEW ================= */}
      {selectedProduct ? (
        <div className="space-y-6">
          {/* Back Button with Directional Transition */}
          <button
            type="button"
            onClick={handleBackToList}
            className="pressable inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.05] border border-line text-ink-2 hover:text-ink hover:bg-white/10 text-sm font-semibold transition-all"
          >
            <BackIcon sx={{ fontSize: 18 }} />
            <span>{isFa ? 'بازگشت به لیست محصولات' : 'Back to Catalog'}</span>
          </button>

          {/* Shared Element Card Container */}
          <ViewTransition name={`product-card-${selectedProduct.id}`} share="morph">
            <GlassCard elevated className="p-6 sm:p-8 space-y-6">
              {/* Product Hero Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Shared Element Icon / Image */}
                  <ViewTransition name={`product-image-${selectedProduct.id}`} share="morph">
                    <div
                      className={clsx(
                        'w-16 h-16 rounded-[22px] bg-gradient-to-br flex items-center justify-center text-[var(--accent)] shadow-accent-glow border border-white/15',
                        selectedProduct.accentBg
                      )}
                    >
                      {selectedProduct.icon}
                    </div>
                  </ViewTransition>

                  <div>
                    {/* Shared Element Badge */}
                    <ViewTransition name={`product-badge-${selectedProduct.id}`} share="morph">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] text-xs font-bold border border-[var(--accent-border)]">
                        <AutoAwesomeRoundedIcon sx={{ fontSize: 13 }} />
                        {isFa ? selectedProduct.categoryFa : selectedProduct.categoryEn}
                      </span>
                    </ViewTransition>

                    {/* Shared Element Title with Text-Morph */}
                    <ViewTransition name={`product-title-${selectedProduct.id}`} share="text-morph">
                      <h1 className="text-xl sm:text-2xl font-extrabold text-ink mt-1.5 leading-tight">
                        {isFa ? selectedProduct.titleFa : selectedProduct.titleEn}
                      </h1>
                    </ViewTransition>
                  </div>
                </div>

                {/* Price Display */}
                <div className="text-start sm:text-end">
                  <span className="text-xs text-ink-3 block font-medium">
                    {isFa ? 'قیمت نهایی' : 'Price'}
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-[var(--accent)] tabular-nums">
                    {selectedProduct.price}
                  </span>
                </div>
              </div>

              {/* Product Detailed Description */}
              <div className="space-y-3 pt-2 border-t border-line/60">
                <h3 className="text-sm font-bold text-ink-2">
                  {isFa ? 'توضیحات و مهندسی محصول' : 'Product Overview'}
                </h3>
                <p className="text-sm text-ink-2 leading-relaxed">
                  {isFa ? selectedProduct.descriptionFa : selectedProduct.descriptionEn}
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-bold text-ink-3 uppercase tracking-wider">
                  {isFa ? 'ویژگی‌های کلیدی' : 'Key Highlights'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(isFa ? selectedProduct.featuresFa : selectedProduct.featuresEn).map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/[0.03] border border-line flex items-center gap-2.5"
                    >
                      <CheckCircleRoundedIcon sx={{ fontSize: 16, color: 'var(--accent)' }} />
                      <span className="text-xs font-medium text-ink">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                className="pressable w-full h-12 rounded-2xl bg-gradient-to-r from-[var(--accent-light)] to-[var(--accent-dark)] text-[var(--accent-ink)] font-bold text-sm flex items-center justify-center gap-2 shadow-accent-glow"
              >
                <ShoppingBagOutlinedIcon sx={{ fontSize: 20 }} />
                <span>{isFa ? 'سفارش و ثبت نهایی' : 'Add to Focus Space'}</span>
              </button>
            </GlassCard>
          </ViewTransition>
        </div>
      ) : (
        /* ================= VIEW 2: PRODUCT LIST CATALOG ================= */
        <div className="space-y-6">
          <header className="space-y-1">
            <h2 className="text-2xl font-extrabold text-ink">
              {isFa ? 'محصولات و تجهیزات فوکوس' : 'Focus Products Catalog'}
            </h2>
            <p className="text-xs text-ink-3">
              {isFa
                ? 'برای مشاهده ترنزیشن باز شدن کارت محصول (<ViewTransition>)، روی یکی از موارد زیر کلیک کنید.'
                : 'Click on any product card to trigger smooth shared element <ViewTransition> expansion.'}
            </p>
          </header>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 gap-4">
            {SAMPLE_PRODUCTS.map((product) => (
              <ViewTransition
                key={product.id}
                name={`product-card-${product.id}`}
                share="morph"
              >
                <GlassCard
                  onClick={() => handleSelectProduct(product)}
                  className="p-4 sm:p-5 cursor-pointer hover:bg-white/[0.06] transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Shared Image / Icon */}
                    <ViewTransition name={`product-image-${product.id}`} share="morph">
                      <div
                        className={clsx(
                          'w-12 h-12 rounded-[16px] bg-gradient-to-br flex items-center justify-center text-[var(--accent)] shrink-0 border border-white/10',
                          product.accentBg
                        )}
                      >
                        {product.icon}
                      </div>
                    </ViewTransition>

                    {/* Content Column */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <ViewTransition name={`product-badge-${product.id}`} share="morph">
                          <span className="text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded-full border border-[var(--accent-border)]">
                            {isFa ? product.categoryFa : product.categoryEn}
                          </span>
                        </ViewTransition>
                      </div>

                      {/* Shared Title */}
                      <ViewTransition name={`product-title-${product.id}`} share="text-morph">
                        <h3 className="text-sm sm:text-base font-bold text-ink truncate mt-1">
                          {isFa ? product.titleFa : product.titleEn}
                        </h3>
                      </ViewTransition>
                    </div>
                  </div>

                  {/* Price & Forward Icon */}
                  <div className="flex items-center gap-3 shrink-0 text-end">
                    <span className="text-xs sm:text-sm font-bold text-[var(--accent)] tabular-nums">
                      {product.price}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center text-ink-3">
                      <BackIcon sx={{ fontSize: 16, transform: isFa ? 'rotate(180deg)' : 'none' }} />
                    </div>
                  </div>
                </GlassCard>
              </ViewTransition>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
