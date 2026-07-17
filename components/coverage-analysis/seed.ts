import type { CoverageCategory, SeedCoverageCategory } from "./types";

export const SEED: SeedCoverageCategory[] = [
  {
    cat: "가족보장",
    items: [
      { name: "질병사망", needed: 10000, held: 0, ins: [] },
      {
        name: "상해사망",
        needed: 20000,
        held: 11000,
        ins: [
          { ins: "현대해상(간편건강)", amt: 1000 },
          { ins: "현대해상(퍼펙트N)", amt: 10000 },
        ],
      },
      { name: "질병후유장해(3%)", needed: 3000, held: 0, ins: [] },
      {
        name: "상해후유장해(3%)",
        needed: 10000,
        held: 10000,
        ins: [{ ins: "현대해상(퍼펙트N)", amt: 10000 }],
      },
    ],
  },
  {
    cat: "큰병보장",
    items: [
      { name: "유사암진단비", needed: 1000, held: 0, ins: [] },
      { name: "암진단비", needed: 7000, held: 0, ins: [] },
      { name: "고액암진단비", needed: 5000, held: 0, ins: [] },
      { name: "2차암/재진단암", needed: 2000, held: 0, ins: [] },
      {
        name: "표적항암약물허가치료비",
        needed: 5000,
        held: 9000,
        ins: [{ ins: "현대해상(간편건강)", amt: 9000 }],
      },
      {
        name: "뇌혈관질환진단비",
        needed: 2000,
        held: 1000,
        ins: [{ ins: "현대해상(간편건강)", amt: 1000 }],
      },
      {
        name: "뇌졸중진단비",
        needed: 3000,
        held: 1500,
        ins: [
          { ins: "현대해상(간편건강)", amt: 1000 },
          { ins: "현대해상(퍼펙트N)", amt: 500 },
        ],
      },
      {
        name: "뇌출혈진단비",
        needed: 3000,
        held: 1500,
        ins: [
          { ins: "현대해상(간편건강)", amt: 1000 },
          { ins: "현대해상(퍼펙트N)", amt: 500 },
        ],
      },
      {
        name: "허혈성심질환진단비",
        needed: 2000,
        held: 1000,
        ins: [{ ins: "현대해상(간편건강)", amt: 1000 }],
      },
      {
        name: "급성심근경색증진단비",
        needed: 3000,
        held: 1500,
        ins: [
          { ins: "현대해상(간편건강)", amt: 1000 },
          { ins: "현대해상(퍼펙트N)", amt: 500 },
        ],
      },
    ],
  },
  {
    cat: "의료보장",
    items: [
      {
        name: "질병입원 실손",
        needed: 5000,
        held: 5000,
        ins: [{ ins: "현대해상(퍼펙트N)", amt: 5000 }],
      },
      {
        name: "질병통원 실손",
        needed: 30,
        held: 30,
        ins: [{ ins: "현대해상(퍼펙트N)", amt: 30 }],
      },
      {
        name: "상해입원 실손",
        needed: 5000,
        held: 5000,
        ins: [{ ins: "현대해상(퍼펙트N)", amt: 5000 }],
      },
      {
        name: "상해통원 실손",
        needed: 30,
        held: 30,
        ins: [{ ins: "현대해상(퍼펙트N)", amt: 30 }],
      },
      { name: "질병입원일당(1일이상)", needed: 3, held: 0, ins: [] },
      {
        name: "상해입원일당(1일이상)",
        needed: 3,
        held: 1,
        ins: [{ ins: "현대해상(뉴하이카)", amt: 1 }],
      },
      {
        name: "질병수술비",
        needed: 50,
        held: 40,
        ins: [{ ins: "현대해상(간편건강)", amt: 40 }],
      },
      {
        name: "상해수술비",
        needed: 150,
        held: 50,
        ins: [{ ins: "현대해상(뉴하이카)", amt: 50 }],
      },
    ],
  },
  {
    cat: "간병보장",
    items: [
      { name: "경증치매(CDR 2점이하)", needed: 2000, held: 0, ins: [] },
      { name: "중증치매(CDR 3점이상)", needed: 4000, held: 0, ins: [] },
      { name: "장기요양진단(4급)", needed: 2000, held: 0, ins: [] },
      { name: "장기요양진단(1급)", needed: 4000, held: 0, ins: [] },
    ],
  },
  {
    cat: "생활보장",
    items: [
      {
        name: "대인형사합의지원금",
        needed: 20000,
        held: 20000,
        ins: [{ ins: "현대해상(뉴하이카)", amt: 20000 }],
      },
      {
        name: "변호사선임비용",
        needed: 5000,
        held: 5000,
        ins: [{ ins: "현대해상(뉴하이카)", amt: 5000 }],
      },
      {
        name: "운전자벌금",
        needed: 3000,
        held: 3500,
        ins: [{ ins: "현대해상(뉴하이카)", amt: 3500 }],
      },
      {
        name: "자동차사고부상발생금",
        needed: 30,
        held: 30,
        ins: [{ ins: "현대해상(뉴하이카)", amt: 30 }],
      },
      { name: "화재벌금", needed: 2000, held: 0, ins: [] },
      {
        name: "일상생활배상책임",
        needed: 10000,
        held: 10000,
        ins: [{ ins: "현대해상(퍼펙트N)", amt: 10000 }],
      },
      { name: "임플란트치료비", needed: 100, held: 0, ins: [] },
      { name: "크라운치료비", needed: 20, held: 0, ins: [] },
      {
        name: "골절진단비",
        needed: 30,
        held: 50,
        ins: [
          { ins: "현대해상(뉴하이카)", amt: 20 },
          { ins: "현대해상(퍼펙트N)", amt: 30 },
        ],
      },
    ],
  },
];

let id = 1;

export const uid = () => `k${id++}`;

export const buildFromSeed = (): CoverageCategory[] =>
  SEED.map((category) => ({
    id: uid(),
    name: category.cat,
    items: category.items.map((item) => ({
      id: uid(),
      name: item.name,
      needed: item.needed,
      heldManual: item.ins.length ? 0 : item.held,
      insurers: item.ins.map((insurer) => ({
        id: uid(),
        name: insurer.ins,
        amount: insurer.amt,
      })),
    })),
  }));
