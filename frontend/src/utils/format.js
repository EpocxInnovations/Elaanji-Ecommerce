export function formatINR(amount) {
  if (amount === null || amount === undefined) return ''
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const SAREE_TYPE_LABELS = {
  kanjivaram: 'Kanjivaram',
  banarasi: 'Banarasi',
  tussar: 'Tussar',
  bandhani: 'Bandhani',
  chanderi: 'Chanderi',
  kanchipuram_silk: 'Kanchipuram Silk',
  mysore_silk: 'Mysore Silk',
  linen: 'Linen',
  organza: 'Organza',
  georgette: 'Georgette',
  chiffon: 'Chiffon',
  cotton: 'Cotton',
  tissue: 'Tissue',
  designer: 'Designer',
  other: 'Other',
}

export const OCCASION_LABELS = {
  wedding: 'Wedding',
  festive: 'Festive',
  casual: 'Casual',
  party: 'Party',
  office: 'Office',
  puja: 'Puja',
  reception: 'Reception',
}
