const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Vault",async()=>{
  let signers;
  let vault;
  let token;

  beforeEach(async()=>{
    signers = await ethers.getSigners();
    const Token = await ethers.getContractFactory("VaultToken");
    token = await Token.connect(signers[0]).deploy(signers[1].address);
    await token.deployed();

    const Vault = await ethers.getContractFactory("Vault");
    vault = await Vault.connect(signers[0]).deploy(token.address,"VaultToken","VTK");
    await vault.deployed();
  });


    describe("Call functions",async()=>{

      it("Should return name of underlying token", async()=>{
        let tknName = await vault.name();
        expect(tknName).to.equal('VaultToken');
      });
      it("Should return symbol of underlying token", async()=>{
        let tknSymbol = await vault.symbol();
        expect(tknSymbol).to.equal('VTK');
      });
      it("Should convert inputed assets to share", async()=>{
        let shares = await vault.convertToShares(100);
        expect(shares).to.equal(100);
      });
      it("Should convert inputed assets to share", async()=>{
        let assets = await vault.convertToAssets(100);
        expect(assets).to.equal(100);
      });
    });
    describe("deposit tokens",async()=>{

      it("Should deposit tokens and get underlying tokens in exchange", async()=>{
        let iniBalance = parseInt(await token.balanceOf(signers[1].address));
        await token.connect(signers[1]).approve(vault.address,100);
        await vault.connect(signers[1]).deposit(100,signers[1].address);
        let finalBalance = parseInt(await token.balanceOf(signers[1].address));
        await expect(iniBalance).to.equal(finalBalance+100);
      });

      it("Should deposit tokens to another receiver and get underlying tokens in exchange", async()=>{
        let iniBalance = parseInt(await token.balanceOf(signers[1].address));
        await token.connect(signers[1]).approve(vault.address,100);
        await vault.connect(signers[1]).deposit(100,signers[2].address);
        let finalBalance = parseInt(await token.balanceOf(signers[1].address));
        await expect(iniBalance).to.equal(finalBalance+100);
      });
    });
    describe("withdraw tokens",async()=>{

      it("Should withdraw tokens", async()=>{
  
        await token.connect(signers[1]).approve(vault.address,100);
        let iniBalance = parseInt(await token.balanceOf(signers[1].address));
        await vault.connect(signers[1]).deposit(100,signers[1].address);
        await vault.connect(signers[1]).withdraw(100,signers[1].address,signers[1].address);
        let finalBalance = await token.balanceOf(signers[1].address);
        expect(finalBalance).to.equal(iniBalance);
    
      });
      it("Should withdraw tokens from previously added receiver", async()=>{
        await token.connect(signers[1]).approve(vault.address,100);
        let iniBalance = parseInt(await token.balanceOf(signers[1].address));
        await vault.connect(signers[1]).deposit(100,signers[2].address);
        await vault.connect(signers[2]).withdraw(100,signers[1].address,signers[2].address);
        let finalBalance = await token.balanceOf(signers[1].address);
        expect(finalBalance).to.equal(iniBalance);
      });
    });


    describe("Mint tokens",async()=>{

      it("Should mint shares according to assets", async()=>{
        let appAmount = parseInt(await vault.connect(signers[1]).previewMint(100));
        let iniBalance = parseInt(await token.balanceOf(signers[1].address));
        await token.connect(signers[1]).approve(vault.address,appAmount);
        await vault.connect(signers[1]).mint(100,signers[1].address);
        let recFnlBalance = parseInt(await vault.balanceOf(signers[1].address));
        let fnlBalance = parseInt(await token.balanceOf(signers[1].address));
        expect(iniBalance).to.equal(fnlBalance+100);
        expect(recFnlBalance).to.equal(100);
      });

      it("Should mint shares to different receiver address according to assets", async()=>{
        let appAmount = parseInt(await vault.connect(signers[1]).previewMint(100));
        await token.connect(signers[1]).approve(vault.address,appAmount);
        await vault.connect(signers[1]).mint(100,signers[2].address);
        let recFnlBalance = parseInt(await vault.balanceOf(signers[2].address));
        expect(recFnlBalance).to.equal(100);
      });
    });

    describe("Redeem tokens",async()=>{

      it("Should redeem underlying tokens", async()=>{
        await token.connect(signers[1]).approve(vault.address,100);
        await vault.connect(signers[1]).deposit(100,signers[1].address);
        let iniBalance = parseInt(await token.balanceOf(signers[1].address));
        await vault.connect(signers[1]).redeem(100,signers[1].address,signers[1].address);
        let fnlBalance = parseInt(await token.balanceOf(signers[1].address));
        expect(iniBalance).to.equal(fnlBalance-100);
      });

      it("Should redeem underlying tokens from previously defined receiver address", async()=>{
        await token.connect(signers[1]).approve(vault.address,100);
        await vault.connect(signers[1]).deposit(100,signers[2].address);
        let iniBalance = parseInt(await token.balanceOf(signers[1].address));
        await vault.connect(signers[2]).redeem(100,signers[1].address,signers[2].address);
        let fnlBalance = parseInt(await token.balanceOf(signers[1].address));
        expect(iniBalance).to.equal(fnlBalance-100);
      });
    });  

  describe("Error cases",async()=>{

    it("should not deposit if asset amount is zero",async()=>{
      await token.connect(signers[1]).approve(vault.address,100);
      await expect( vault.connect(signers[1]).deposit(0,signers[1].address)).to.be.revertedWith("ZERO_SHARES");
    });

    it("should not redeem if shares amount is zero",async()=>{
        await token.connect(signers[1]).approve(vault.address,100);
        await vault.connect(signers[1]).deposit(100,signers[1].address);
        await expect(vault.connect(signers[1]).redeem(0,signers[1].address,signers[1].address)).revertedWith("ZERO_ASSETS");
    });
  });
});

