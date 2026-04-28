import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { reviewGenerateSchema } from '@/lib/validation/review';
import { z } from 'zod';

const NAMES_ES = [
  'María G.', 'Carlos R.', 'Lucía M.', 'Alejandro P.', 'Ana S.',
  'Pablo D.', 'Laura T.', 'Javier F.', 'Carmen L.', 'Diego N.',
  'Isabel V.', 'Raúl H.', 'Elena B.', 'Marcos A.', 'Sofía C.',
  'Andrés J.', 'Marta E.', 'Daniel O.', 'Patricia I.', 'Hugo K.',
];

const NAMES_EN = [
  'Sarah M.', 'James T.', 'Emily R.', 'Michael P.', 'Jessica L.',
  'David K.', 'Amanda W.', 'Chris B.', 'Rachel S.', 'Andrew N.',
  'Sophie H.', 'Tom D.', 'Laura F.', 'Mark C.', 'Katie J.',
  'Ryan A.', 'Nicole E.', 'Dan O.', 'Lisa V.', 'Alex G.',
];

// Templates with {name} placeholder replaced with product name
// Each category has specific templates; generic ones are fallback
const CATEGORY_BODIES_ES: Record<string, Record<number, string[]>> = {
  sleep: {
    5: [
      'Desde que uso {name} duermo muchísimo mejor. Me despierto descansada de verdad.',
      '{name} ha sido un antes y un después en mi rutina de sueño. Totalmente recomendable.',
      'Llevo un mes con {name} y la calidad de mi sueño ha mejorado notablemente. Mi pareja también lo quiere.',
      'Increíble. {name} me ayuda a conciliar el sueño mucho más rápido. Muy contento.',
      'Me lo recomendó mi fisio y no me arrepiento. {name} funciona de verdad para descansar mejor.',
    ],
    4: [
      '{name} funciona bien para dormir. No es magia pero se nota mejora después de unas semanas.',
      'Buen producto para el sueño. {name} cumple, aunque tardé en notar los efectos.',
      'Me gusta {name}, duermo algo mejor. Le doy 4 porque el envío fue lento.',
    ],
    3: [
      '{name} está bien para el sueño, pero esperaba más efecto. Quizá necesite más tiempo.',
      'Correcto. {name} me ayuda un poco a dormir pero no es tan potente como esperaba.',
    ],
  },
  nutrition: {
    5: [
      '{name} es justo lo que buscaba para complementar mi dieta. Se nota la diferencia en energía.',
      'Llevo 3 meses con {name} y me siento con más vitalidad. Repetiré seguro.',
      'Excelente calidad. {name} tiene buenos ingredientes y se nota. Muy recomendable.',
      'Mi nutricionista me recomendó {name} y estoy encantada con los resultados.',
      '{name} me ha ayudado a cubrir carencias que tenía. Se nota desde la primera semana.',
    ],
    4: [
      '{name} es un buen suplemento nutricional. Calidad correcta aunque algo caro.',
      'Funciona bien. {name} complementa mi alimentación, pero el sabor podría mejorar.',
      'Buena compra. {name} tiene buena composición aunque esperaba resultados más rápidos.',
    ],
    3: [
      '{name} está bien pero no noto tanto cambio como esperaba. Seguiré probando.',
      'Correcto para nutrición. {name} cumple pero hay opciones mejores por precio similar.',
    ],
  },
  stress: {
    5: [
      '{name} me ayuda mucho a gestionar el estrés del día a día. Lo noto desde la primera semana.',
      'Desde que uso {name} me siento mucho más tranquilo. Lo recomiendo a todo el mundo.',
      'Increíble {name}. Mi nivel de ansiedad ha bajado bastante. Muy agradecida.',
      '{name} es de lo mejor que he probado para el estrés. Funciona de verdad.',
      'Brutal. {name} me ha cambiado la rutina. Me siento más calmado y enfocado.',
    ],
    4: [
      '{name} ayuda con el estrés, pero no es instantáneo. Hay que ser constante.',
      'Buen producto para la calma. {name} funciona bien aunque tarda unas semanas en notarse.',
      'Me gusta {name}. Me siento algo más relajado, aunque esperaba un efecto más fuerte.',
    ],
    3: [
      '{name} está bien para el estrés pero el efecto es sutil. No sé si repetiré.',
      'Correcto. {name} me ayuda un poco pero no es el cambio radical que esperaba.',
    ],
  },
  exercise: {
    5: [
      '{name} ha mejorado mi rendimiento en el gym. Se nota la diferencia en resistencia.',
      'Llevo usando {name} un mes y mis entrenamientos han subido de nivel. Brutal.',
      'Excelente para entrenar. {name} me da más energía y me recupero más rápido.',
      '{name} es justo lo que necesitaba para mis entrenamientos. 100% recomendable.',
      'Mi entrenador me recomendó {name} y ha sido un acierto total. Muy contento.',
    ],
    4: [
      '{name} funciona bien para el ejercicio. Noto mejora pero no es dramático.',
      'Buen complemento deportivo. {name} está bien aunque el precio podría ser algo menor.',
      'Me gusta {name} para entrenar. Buenos resultados, el envío fue un poco lento.',
    ],
    3: [
      '{name} está bien para el deporte, pero esperaba más impacto por el precio.',
      'Correcto para ejercicio. {name} cumple pero hay opciones más completas.',
    ],
  },
  hydration: {
    5: [
      '{name} me ha ayudado a hidratarme mucho mejor. Se nota en la piel y en la energía.',
      'Desde que uso {name} bebo más agua y me siento con más vitalidad. Muy contenta.',
      'Excelente. {name} tiene un sabor agradable y me ayuda a mantenerme hidratada.',
      '{name} es genial. Se nota la diferencia cuando te hidratas bien. Repetiré.',
      'Llevo 2 meses con {name} y la mejora en mi piel es evidente. Recomendadísimo.',
    ],
    4: [
      '{name} funciona bien para la hidratación. Buen sabor aunque algo caro.',
      'Buen producto. {name} me ayuda a hidratarme más, pero podría tener más sabores.',
      '{name} está muy bien. Me hidrato mejor, le doy 4 porque el envío tardó.',
    ],
    3: [
      '{name} está bien pero hay formas más baratas de hidratarse bien.',
      'Correcto. {name} sabe bien pero no noto tanta diferencia como esperaba.',
    ],
  },
  productivity: {
    5: [
      '{name} me ha ayudado a concentrarme mucho mejor en el trabajo. Increíble.',
      'Desde que uso {name} rindo más y me despisto menos. Muy recomendable.',
      '{name} es brutal para la productividad. Me enfoco mejor y no me canso tanto.',
      'Excelente. {name} ha mejorado mi concentración desde la primera semana.',
      'Mi compañera de trabajo me recomendó {name} y tiene toda la razón. Funciona.',
    ],
    4: [
      '{name} ayuda con el enfoque, pero hay que ser constante para notarlo.',
      'Buen producto para productividad. {name} me ayuda algo, no es magia pero funciona.',
      '{name} está bien para concentrarse. Buenos ingredientes, precio justo.',
    ],
    3: [
      '{name} está bien pero no noto un cambio radical en mi productividad.',
      'Correcto. {name} ayuda un poco al enfoque pero esperaba más.',
    ],
  },
};

const CATEGORY_BODIES_EN: Record<string, Record<number, string[]>> = {
  sleep: {
    5: [
      'Since I started using {name} I sleep so much better. I wake up actually rested.',
      '{name} has been a game changer for my sleep routine. Totally recommended.',
      'One month with {name} and my sleep quality has improved significantly. My partner wants one too.',
      'Amazing. {name} helps me fall asleep much faster. Very happy.',
      'My physiotherapist recommended {name} and I don\'t regret it. It really works for better rest.',
    ],
    4: [
      '{name} works well for sleep. Not magic but you notice improvement after a few weeks.',
      'Good sleep product. {name} delivers, though it took a while to feel the effects.',
      'I like {name}, I sleep a bit better. Giving 4 because shipping was slow.',
    ],
    3: [
      '{name} is okay for sleep, but I expected more impact. Maybe I need more time.',
      'Decent. {name} helps me sleep a little but it\'s not as strong as I expected.',
    ],
  },
  nutrition: {
    5: [
      '{name} is exactly what I was looking for to complement my diet. Noticeable energy boost.',
      'Been on {name} for 3 months and I feel more vital. Will definitely reorder.',
      'Excellent quality. {name} has great ingredients and you can tell. Highly recommended.',
      'My nutritionist recommended {name} and I\'m thrilled with the results.',
      '{name} helped me cover nutritional gaps. You can feel it from the first week.',
    ],
    4: [
      '{name} is a good nutritional supplement. Decent quality though a bit pricey.',
      'Works well. {name} complements my diet, but the taste could be better.',
      'Good purchase. {name} has a good formula though I expected faster results.',
    ],
    3: [
      '{name} is fine but I don\'t notice as much change as I expected. Will keep trying.',
      'Decent for nutrition. {name} works but there are better options at a similar price.',
    ],
  },
  _generic: {
    5: [
      'Excellent product. {name} exceeded my expectations. Very happy with my purchase.',
      '{name} is incredible value for money. Already bought it twice.',
      'Love {name}. I recommend it to everyone, the difference is noticeable from week one.',
      '{name} really works. A friend recommended it and now I understand why.',
      'Great quality. {name} is well made. Will definitely buy again.',
    ],
    4: [
      '{name} is good overall. Quality is nice though the price could be a bit lower.',
      'Works well. {name} does what it promises. Giving 4 because shipping was a bit slow.',
      'Good purchase. {name} is not perfect but it\'s great for the price.',
    ],
    3: [
      '{name} is decent but I expected more for the price. Shipping was fast though.',
      'It\'s okay. {name} is nothing special but it\'s not bad either.',
    ],
  },
};

// Generic fallback for categories without specific templates
const GENERIC_BODIES_ES: Record<number, string[]> = {
  5: [
    'Excelente. {name} ha superado mis expectativas. Muy contenta con la compra.',
    'Increíble relación calidad-precio. {name} funciona de verdad.',
    'Me encanta {name}. Lo recomiendo a todo el mundo, se nota la diferencia.',
    'Me lo recomendó una amiga y tiene razón. {name} funciona de verdad.',
    'Muy buena calidad. {name} está muy bien hecho. Repetiré seguro.',
    'Llevo 3 meses con {name} y los resultados hablan por sí solos.',
    '{name} es justo lo que necesitaba. Fácil de usar y resultados rápidos.',
    'Brutal. Llevo un mes con {name} y el cambio es notable. Mi pareja también lo quiere.',
    'De lo mejor que he probado. {name} es 100% recomendable.',
    '{name} ha sido un acierto total. No me arrepiento de la compra.',
  ],
  4: [
    '{name} es buen producto. La calidad es buena aunque el precio podría ser menor.',
    'Funciona bien. {name} cumple lo que promete, el envío fue algo lento.',
    'Buena compra. {name} no es perfecto pero para el precio está muy bien.',
    'Me gusta {name}. Llevo dos semanas y noto mejora, esperaba algo más rápido.',
    'Correcto. {name} hace lo que dice. El packaging podría mejorar.',
  ],
  3: [
    '{name} cumple su función pero esperaba algo más por el precio.',
    'Está bien pero {name} no es nada del otro mundo. Quizá necesite más tiempo.',
    'Producto decente. {name} no me ha cambiado la vida pero tampoco está mal.',
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getBodies(locale: 'es' | 'en', category: string, rating: 3 | 4 | 5): string[] {
  if (locale === 'es') {
    return CATEGORY_BODIES_ES[category]?.[rating] || GENERIC_BODIES_ES[rating];
  }
  return CATEGORY_BODIES_EN[category]?.[rating] || CATEGORY_BODIES_EN['_generic']?.[rating] || GENERIC_BODIES_ES[rating];
}

function generateSeedReviews(count: number, locale: 'es' | 'en', productName: string, category: string) {
  const names = locale === 'es' ? NAMES_ES : NAMES_EN;
  const reviews: { author_name: string; rating: number; body: string; days_ago: number }[] = [];
  const usedNames = new Set<string>();
  const usedBodies = new Set<string>();

  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    const rating: 3 | 4 | 5 = roll < 0.05 ? 3 : roll < 0.30 ? 4 : 5;

    const pool = getBodies(locale, category, rating);
    // Try to pick a unique body
    let body = pickRandom(pool).replace(/\{name\}/g, productName);
    let bodyAttempts = 0;
    while (usedBodies.has(body) && bodyAttempts < pool.length) {
      body = pool[bodyAttempts % pool.length].replace(/\{name\}/g, productName);
      bodyAttempts++;
    }
    usedBodies.add(body);

    let name = pickRandom(names);
    let nameAttempts = 0;
    while (usedNames.has(name) && nameAttempts < 30) {
      name = pickRandom(names);
      nameAttempts++;
    }
    usedNames.add(name);

    const days_ago = Math.floor(Math.random() * 170) + 3;
    reviews.push({ author_name: name, rating, body, days_ago });
  }

  return reviews;
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ('response' in auth) return auth.response;

  let reqBody: unknown;
  try {
    reqBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = reviewGenerateSchema.safeParse(reqBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }
  const { product_id, count, locale } = parsed.data;

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('id, name, category')
    .eq('id', product_id)
    .single();

  if (!product) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  }

  try {
    const reviews = generateSeedReviews(count, locale, product.name, product.category);

    await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('product_id', product_id)
      .eq('is_seed', true);

    const now = Date.now();
    const rows = reviews.map((r) => ({
      product_id,
      user_id: null,
      author_name: r.author_name,
      rating: r.rating,
      body: r.body,
      is_seed: true,
      is_verified_purchase: false,
      locale,
      created_at: new Date(now - r.days_ago * 86400000).toISOString(),
    }));

    const { error: insertError } = await supabaseAdmin.from('reviews').insert(rows);
    if (insertError) {
      console.error('Failed to insert seed reviews:', insertError);
      return NextResponse.json(
        { error: `Error insertando reseñas: ${insertError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, generated: rows.length });
  } catch (err) {
    console.error('Seed review generation failed:', err);
    return NextResponse.json(
      { error: `Error: ${err instanceof Error ? err.message : 'Unknown'}` },
      { status: 500 },
    );
  }
}
