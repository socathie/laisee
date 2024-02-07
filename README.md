# Laisee

Personal rewrite of the [`RedPocket` contract](https://mumbai.polygonscan.com/address/0xa007311295fb9f505dc4114aa557fdb8170d2731)

Key optimizations:
- Tokens are stored in one contract, rather than a contract being deployed for each user
    - saves on gas costs
    - easily see all laisees in one place
- Minting and depositing are now merged into one function
    - one less transaction (and hence gas cost) for the user
- Withdraw function checks for token ownership rather than "contract" ownership (in previous design)
    - balance is transferred with the token
    - allow reuse of the same token for sending to multiple users (optional)

Optional changes:
- Change to ERC721Enumerable so that users can withdraw all laisees at once
- Two versions of withdraw functions
    - One that allows for the user to withdraw all laisees at once
    - One that allows for the user to withdraw a specific laisee
- Allow/disallow empty laisees
- Laisee is minted to sender first so that the recipient can see it is sent from which address

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
```
