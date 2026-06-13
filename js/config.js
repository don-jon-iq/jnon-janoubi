/* =====================================================
   جنون جنوبي — config.js
   ⚠️ هذا الملف هو المكان الوحيد الذي تحتاج تعديله:
   1. ضع رقم واتساب المتجر في WHATSAPP_NUMBER
      بالصيغة الدولية بدون + (مثال: 9647701234567)
   2. عدّل الأسعار والأوصاف كما تريد
   ===================================================== */

'use strict';

var STORE_CONFIG = Object.freeze({
  // ← ← ← ضع رقمك هنا — مثال: '9647701234567'
  WHATSAPP_NUMBER: 'PUT_YOUR_NUMBER_HERE',

  CURRENCY: 'د.ع',

  COLLECTIONS: Object.freeze([
    Object.freeze({
      id: 'basra-heritage',
      name: 'تراث البصرة',
      tag: 'الإصدار الأول',
      desc: 'النخلة، الشناشيل، والمشحوف على خارطة البصرة',
      image: 'assets/keychain-enamel.jpg',
      available: true,
      items: Object.freeze([
        Object.freeze({
          id: 'pin-silver',
          name: 'الدبوس الفضي العتيق',
          desc: 'بروش بطلاء فضي عتيق ونقش بارز ثلاثي الأبعاد — أناقة هادئة تلبسها على الصدر أو الحقيبة.',
          price: 25000, // ← عدّل السعر
          image: 'assets/pin-silver.jpg'
        }),
        Object.freeze({
          id: 'keychain-enamel',
          name: 'ميدالية المينا الملوّنة',
          desc: 'ميدالية مفاتيح بمينا ملوّنة يدوياً بألوان البصرة الحقيقية وحواف معدنية بارزة.',
          price: 15000, // ← عدّل السعر
          image: 'assets/keychain-enamel.jpg'
        }),
        Object.freeze({
          id: 'magnet-gold',
          name: 'المغناطيس الذهبي',
          desc: 'مغناطيس ثلاجة بطلاء ذهبي لامع وظهر مغناطيسي قوي — قطعة من البصرة في بيتك.',
          price: 15000, // ← عدّل السعر
          image: 'assets/magnet-gold.jpg'
        })
      ])
    }),
    Object.freeze({
      id: 'coming-soon',
      name: 'الإصدار القادم',
      desc: 'مجموعة جديدة قيد التصميم',
      available: false,
      items: Object.freeze([])
    })
  ])
});
