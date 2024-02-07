const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Laisee", function () {
  let laisee;
  let addr0;
  let addr1;
  let addr2;
  let addrs;

  before(async function () {
    const Laisee = await ethers.getContractFactory("Laisee");
    [addr0, addr1, addr2, ...addrs] = await ethers.getSigners();
    laisee = await Laisee.deploy();
  });

  describe("Laisee", function () {

    it("Should mint a new laisee", async function () {
      // expect event to be emitted with addr0 as sender, addr1 as receiver, and token id 
      expect(await laisee.mint(addr1.address))
        .to.emit(laisee, "Transfer")
        .withArgs(addr0.address, addr1.address, 1);
      expect(await laisee.balanceOf(addr1.address)).to.equal(1);
      expect(await laisee.ownerOf(1)).to.equal(addr1.address);
    });

    it("Should mint a new laisee with deposit", async function () {
      // expect event to be emitted with addr0 as sender, addr1 as receiver, and token id 
      expect(await laisee.mint(addr1.address, { value: ethers.parseEther("1") }))
        .to.emit(laisee, "Transfer")
        .withArgs(addr0.address, addr1.address, 2);
      expect(await laisee.balanceOf(addr1.address)).to.equal(2);
      expect(await laisee.ownerOf(2)).to.equal(addr1.address);
    });

    it("Should withdraw all laisees at once", async function () {
      // get original balance of addr1
      const originalBalance = await ethers.provider.getBalance(addr1.address);
      // send one more laisee to addr1 from addr2 (change signer)
      await laisee.connect(addr2).mint(addr1.address, { value: ethers.parseEther("1") });
      expect(await laisee.balanceOf(addr1.address)).to.equal(3);
      expect(await laisee.ownerOf(3)).to.equal(addr1.address);
      // expect withdraw function will withdraw all laisees
      const tx = await laisee.connect(addr1).withdrawAll();
      // get gas fee paid by addr1
      const receipt = await tx.wait();
      const gasFee = receipt.gasUsed * tx.gasPrice;
      // expect addr1 to receive 2 ethers
      expect(await ethers.provider.getBalance(addr1.address)).to.equal(originalBalance + ethers.parseEther("2") - gasFee);
    });

    it("Should not withdraw if no laisee", async function () {
      // expect withdraw function will revert if no laisee
      await expect(laisee.connect(addr0).withdrawAll()).to.be.revertedWith("Laisee: caller has no laisee");
    });

    it("Should not withdraw if no balance", async function () {
      // expect withdraw function will revert if no balance
      await expect(laisee.connect(addr1).withdrawAll()).to.be.revertedWith("Laisee: caller has no balance");
    });

    it("Should withdraw laisee by token id", async function () {
      // get original balance of addr1
      const originalBalance = await ethers.provider.getBalance(addr1.address);
      // send one more laisee to addr1 from addr2 (change signer)
      await laisee.connect(addr2).mint(addr1.address, { value: ethers.parseEther("1") });
      expect(await laisee.balanceOf(addr1.address)).to.equal(4);
      expect(await laisee.ownerOf(4)).to.equal(addr1.address);
      // expect withdraw function will withdraw laisee with token id 3
      const tx = await laisee.connect(addr1).withdraw(4);
      // get gas fee paid by addr1
      const receipt = await tx.wait();
      const gasFee = receipt.gasUsed * tx.gasPrice;
      // expect addr1 to receive 1 ether
      expect(await ethers.provider.getBalance(addr1.address)).to.equal(originalBalance + ethers.parseEther("1") - gasFee);
    });

    it("Should not withdraw laisee by token id if not owner", async function () {
      // expect withdraw function will revert if not owner
      await expect(laisee.connect(addr2).withdraw(1)).to.be.revertedWith("Laisee: caller is not owner");
    });

    it("Should not withdraw laisee by token id if no balance", async function () {
      // expect withdraw function will revert if no balance
      await expect(laisee.connect(addr1).withdraw(1)).to.be.revertedWith("Laisee: token has no balance");
    });

    it("Should share the love", async function () {
      await laisee.connect(addr1).shareTheLove(1, addr2.address);
      expect(await laisee.balanceOf(addr1.address)).to.equal(3);
      expect(await laisee.balanceOf(addr2.address)).to.equal(1);
      expect(await laisee.ownerOf(1)).to.equal(addr2.address);
    });

    it("Should share the love with deposit", async function () {
      await laisee.connect(addr1).shareTheLove(2, addr2.address, { value: ethers.parseEther("1") });
      expect(await laisee.balanceOf(addr1.address)).to.equal(2);
      expect(await laisee.balanceOf(addr2.address)).to.equal(2);
      expect(await laisee.ownerOf(2)).to.equal(addr2.address);
    });

    it("Should not share the love if not owner", async function () {
      // expect shareTheLove function will revert if not owner
      await expect(laisee.connect(addr1).shareTheLove(1, addr2.address)).to.be.revertedWith("Laisee: caller is not owner");
    });

    it("Should withdraw after sharing the love", async function () {
      // get original balance of addr2
      const originalBalance = await ethers.provider.getBalance(addr2.address);
      // expect withdraw function will withdraw all laisees
      const tx = await laisee.connect(addr2).withdrawAll();
      // get gas fee paid by addr2
      const receipt = await tx.wait();
      const gasFee = receipt.gasUsed * tx.gasPrice;
      // expect addr2 to receive 3 ethers
      expect(await ethers.provider.getBalance(addr2.address)).to.equal(originalBalance + ethers.parseEther("1") - gasFee);
    });
  });
});
