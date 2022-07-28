//imports
//main
//call

const { getNamedAccounts, network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    //to get default accounts on the given network
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // const ethUsdPriceFeedAddress = networkConfig[chainId]("ethUSDPriceFeed")
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        //if contract does'nt exists we deploy mock
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const args = [ethUsdPriceFeedAddress]

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, //price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        chainId != 31337 && //!developmentChains.includes(network.name)
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }

    //localhost,hardhat => mock

    log("------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
