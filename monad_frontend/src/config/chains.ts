export interface ChainConfig {
  readonly selector: string;
  readonly name: string;
  readonly router: string;
  readonly nativeSymbol: string;
  readonly explorerUrl: string;
}

export const chainCatalog: readonly ChainConfig[] = [
  {
    selector: "16015286601757825753",
    name: "Ethereum Mainnet",
    router: "0x2a2a306d964e1DCf90A0Fc3De178C1e92C6A1811",
    nativeSymbol: "ETH",
    explorerUrl: "https://etherscan.io",
  },
  {
    selector: "15971525489660198786",
    name: "Base",
    router: "0x36B1036cd44C9deE689DBF1C2CBF522C4391376C",
    nativeSymbol: "ETH",
    explorerUrl: "https://basescan.org",
  },
  {
    selector: "12532609583862916517",
    name: "Polygon",
    router: "0x1C50bCe1B7B4e68B7b6af694fb914c7C44A9B026",
    nativeSymbol: "MATIC",
    explorerUrl: "https://polygonscan.com",
  },
] as const;

export type ChainSelector = (typeof chainCatalog)[number]["selector"];

export const chainMap: Record<string, ChainConfig> = chainCatalog.reduce(
  (accumulator, chain) => ({ ...accumulator, [chain.selector]: chain }),
  {} as Record<string, ChainConfig>
);
