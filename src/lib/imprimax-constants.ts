export const TEMPLATE_CATEGORIES = {
  cartao_agradecimento: "Cartão de Agradecimento",
  tag_produto:          "Tag de Produto",
  etiqueta:             "Etiqueta",
  rotulo:               "Rótulo",
  lacre_sacola:         "Lacre de Sacola",
  lacre_embalagem:      "Lacre de Embalagem",
  mimo:                 "Cartão de Mimo",
  cartao_pix:           "Cartão PIX",
  cupom:                "Cupom",
  certificado:          "Certificado",
} as const;

export const NICHOS = {
  geral:       "Geral",
  confeitaria: "Confeitaria",
  moda:        "Moda",
  calcados:    "Calçados",
  semijoias:   "Semijoias",
  cosmeticos:  "Cosméticos",
  artesanato:  "Artesanato",
} as const;

export type TemplateCategory = keyof typeof TEMPLATE_CATEGORIES;
export type Nicho = keyof typeof NICHOS;
