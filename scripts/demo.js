import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("\n--- INICIANDO PROTOCOLO ECOSTAKE (SEPOLIA) ---");

  // Endereço oficial do Price Feed ETH/USD da Chainlink na rede Sepolia
  const CHAINLINK_ORACLE_SEPOLIA = "0x694AA1769357215DE4FAC081bf1f309aDC325306";

  // 1. Deploy do EcoToken (ERC20)
  const Token = await ethers.getContractFactory("EcoToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.target;
  console.log(`> EcoToken (ERC20) em: ${tokenAddress}`);

  // 2. Deploy do EcoPass (NFT)
  const NFT = await ethers.getContractFactory("EcoPass");
  const nft = await NFT.deploy();
  await nft.waitForDeployment();
  const nftAddress = await nft.target;
  console.log(`> EcoPass (NFT) em: ${nftAddress}`);

  // 3. Deploy do EcoStaking (Passando Token + Oráculo)
  const Staking = await ethers.getContractFactory("EcoStaking");
  const staking = await Staking.deploy(tokenAddress, CHAINLINK_ORACLE_SEPOLIA);
  await staking.waitForDeployment();
  const stakingAddress = await staking.target;
  console.log(`> EcoStaking em: ${stakingAddress}`);

  // 4. Deploy do EcoGovernance (DAO)
  const Gov = await ethers.getContractFactory("EcoGovernance");
  const gov = await Gov.deploy(nftAddress);
  await gov.waitForDeployment();
  const govAddress = await gov.target;
  console.log(`> EcoGovernance (DAO) em: ${govAddress}`);

  // --- EXECUTANDO OPERAÇÕES DE TESTE (ETAPA 5) ---
  const [deployer] = await ethers.getSigners();
  console.log(`\nExecutando testes com a conta: ${deployer.address}`);

  console.log("\n[ETAPA 5] Emitindo NFT EcoPass para o usuário...");
  const txNft = await nft.safeMint(deployer.address);
  await txNft.wait(); // Espera confirmar na rede
  console.log("OK: NFT emitido.");

  console.log("[ETAPA 5] Realizando Stake de 50 ECT...");
  // Aprovar o contrato de Staking a gastar tokens
  const txApprove = await token.approve(stakingAddress, ethers.parseUnits("50", 18));
  await txApprove.wait();
  
  // Realizar o Stake
  const txStake = await staking.stake(ethers.parseUnits("50", 18));
  await txStake.wait();
  console.log("OK: Stake realizado.");

  console.log("[ETAPA 5] Criando proposta na DAO...");
  const txGov = await gov.createProposal("Aumentar incentivos sustentaveis");
  await txGov.wait();
  console.log("OK: Proposta criada.");

  console.log("\n--- SUCESSO TOTAL NA SEPOLIA ---");
  console.log("Copie todos os endereços '0x...' acima para o seu PDF e README!");
}

main().catch((error) => {
  console.error("\n[ERRO NO DEPLOY]:", error.message);
  process.exitCode = 1;
});