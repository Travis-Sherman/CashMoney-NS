// Make sure to import useState
import React, { useEffect, useState } from "react";
import './styles/App.css';
import { ethers } from "ethers";
import discordLogo from './assets/discord-logo.svg';
import contractABI from './utils/contractABI.json';
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import { networks } from './utils/networks';
import { ToastContainer, toast } from 'react-toastify';

const DISCORD_LINK = process.env.REACT_APP_DISCORD_LINK;

// Add the domain you will be minting
const tld = '.cashmoney';
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const polygonScan = 'https://mumbai.polygonscan.com/token/' + CONTRACT_ADDRESS;

const App = () => {
	//Just a state variable we use to store our user's public wallet. Don't forget to import useState at the top.
	const [currentAccount, setCurrentAccount] = useState('');
  // Add some state data properties
	const [domain, setDomain] = useState('');
  const [superPwr, setSuperPwr] = useState('');
  const [avatar, setAvatar] = useState('');
  const [favNFT,setFavNFT] = useState('');
  const [discord,setDiscord] = useState('');
  const [twitter,setTwitter] = useState('');
  const [favSong,setFavSong] = useState('');
  // Create a stateful variable to store the network next to all the others
  const [network, setNetwork] = useState('');
  // Add a new stateful variable at the start of our component next to all the old ones
	const [editing, setEditing] = useState(false);
  const [mints, setMints] = useState([]);
  const [loading, setLoading] = useState(false);


  // Implement your connectWallet method here
	const connectWallet = async () => {

      try {
        const { ethereum } = window;

        if (!ethereum) {
          alert("Get MetaMask -> https://metamask.io/");
          return;
        }

        // Fancy method to request access to account.
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      
        // Boom! This should print out public address once we authorize Metamask.
        console.log("Connected", accounts[0]);
        setCurrentAccount(accounts[0]);
      } catch (error) {
        console.log(error)
      }
	}
	

	// Update your checkIfWalletIsConnected function to handle the network
	const checkIfWalletIsConnected = async () => {

      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have metamask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
      }
      
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
      } else {
        console.log('No authorized account found');
      }
      
      // This is the new part, we check the user's network chain ID
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      setNetwork(networks[chainId]);

      ethereum.on('chainChanged', handleChainChanged);
      
      // Reload the page when they change networks
      function handleChainChanged(_chainId) {
        window.location.reload();
      }
	};


  const switchNetwork = async () => {

      if (window.ethereum) {
        try {
          // Try to switch to the Mumbai testnet
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x13881' }], // Check networks.js for hexadecimal network ids
          });
        } catch (error) {
          // This error code means that the chain we want has not been added to MetaMask
          // In this case we ask the user to add it to their MetaMask
          if (error.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {	
                    chainId: '0x13881',
                    chainName: 'Polygon Mumbai Testnet',
                    rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
                    nativeCurrency: {
                        name: "Mumbai Matic",
                        symbol: "MATIC",
                        decimals: 18
                    },
                    blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
                  },
                ],
              });
            } catch (error) {
              console.log(error);
            }
          }
          console.log(error);
        }
      } else {
        // If window.ethereum is not found then MetaMask is not installed
        alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
      } 
}



  const mintDomain = async () => {

      // Don't run if the domain is empty
	if (!domain) { return }
	// Alert the user if the domain is too short
	if (domain.length < 3) {
		alert('Domain must be at least 3 characters long');
		return;
	}
	// Calculate price based on length of domain (change this to match your contract)	
	// 3 chars = 0.5 MATIC, 4 chars = 0.3 MATIC, 5 or more = 0.1 MATIC
	const price = domain.length === 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1';
	console.log("Minting domain", domain, "with price", price);
	try {
    	const { ethereum } = window;
    	(ethereum); // eslint-disable-line
      {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
            let tx = await contract.register(domain, {value: ethers.utils.parseEther(price)});
            // Wait for the transaction to be mined
        const receipt = await tx.wait();

        // Check if the transaction was successfully completed
        if (receipt.status === 1) {
          console.log("Domain minted! https://mumbai.polygonscan.com/tx/"+tx.hash);
          toast('🦄 Domain minted!');
          // Set all the record data for the domain if not empty
          if(superPwr !== ''){
            tx = await contract.setRecord(domain, superPwr);
            await tx.wait();
            console.log("SuperPower record set! https://mumbai.polygonscan.com/tx/"+tx.hash);
            toast('💪 SuperPower set!');
          }
          
          if(avatar !== ''){
            tx = await contract.setAvatar(domain, avatar);
            await tx.wait();
            console.log("Avatar record set! https://mumbai.polygonscan.com/tx/"+tx.hash);
            toast('😜 Avatar set!');
          }

          if(favNFT !== ''){
            tx = await contract.setFavNFT(domain, avatar);
            await tx.wait();
            console.log("Fav NFT record set! https://mumbai.polygonscan.com/tx/"+tx.hash);
            toast('🖼 NFT set!');
          }
          
          if(discord !== ''){
            tx = await contract.setDiscord(domain, avatar);
            await tx.wait();
            console.log("Discord username record set! https://mumbai.polygonscan.com/tx/"+tx.hash);
            toast('💬 Discord set!');
          }

          if(twitter !== ''){
            tx = await contract.setTwitter(domain, avatar);
            await tx.wait();
            console.log("Twitter username record set! https://mumbai.polygonscan.com/tx/"+tx.hash);
            toast('🐦 Twitter set!');
          }

          if(favSong !== ''){
            tx = await contract.setFavSong(domain, avatar);
            await tx.wait();
            console.log("Fav song record set! https://mumbai.polygonscan.com/tx/"+tx.hash);
            toast('🎵 Favorite song set!');
          }
            
          // Call fetchMints after 2 seconds
          setTimeout(() => {
            fetchMints();
            
          }, 2000);

          setSuperPwr('');
          setDomain('');
          setAvatar('');
          setFavNFT('');
          setDiscord('');
          setTwitter('');
          setFavSong('');
        } else {
          alert("Transaction failed! Please try again");
        }
    	}
  	} catch(error) {
    	console.log(error);
  	}
}



// Add this function anywhere in your component (maybe after the mint function)
const fetchMints = async () => {

    try {
      const { ethereum } = window;
      if (ethereum) {
        // You know all this
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);
          
        // Get all the domain names from our contract
        const names = await contract.getAllNames();
          
        // For each name, get the record and the address
        const mintRecords = await Promise.all(names.map(async (name) => {
        const mintRecord = await contract.records(name);
        const mintAvatar = await contract.avatars(name);
        const owner = await contract.domains(name);
        return {
          id: names.indexOf(name),
          name: name,
          record: mintRecord,
          avatar: mintAvatar,
          owner: owner,
        };
      }));

      console.log("MINTS FETCHED ", mintRecords);
      setMints(mintRecords);
      }
    } catch(error){
      console.log(error);
    }
}
// This will run any time currentAccount or network are changed
useEffect(() => {
	if (network === 'Polygon Mumbai Testnet') {
		fetchMints();
	}
}, [currentAccount, network]);



const updateDomain = async () => {
    if (!superPwr || !domain) { return }
    setLoading(true);
    console.log("Updating domain", domain, "with record", superPwr);
      try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);

        let tx = await contract.setRecord(domain, superPwr);
        await tx.wait();
        console.log("Record set https://mumbai.polygonscan.com/tx/"+tx.hash);

        fetchMints();
        setSuperPwr('');
        setDomain('');
        setAvatar('');
        setFavNFT('');
        setDiscord('');
        setTwitter('');
        setFavSong('');
      }
      } catch(error) {
        console.log(error);
      }
    setLoading(false);
}



	// Render Methods
	const renderNotConnectedContainer = () => (
		<div className="connect-wallet-container">
			<img src="https://media.giphy.com/media/Lajc1cfRE9z8NIeKrH/giphy.gif" alt="Rdc Cash Money gif" />
			<button className="cta-button connect-wallet-button" 
      onClick={connectWallet}>
				Connect Wallet
			</button>
		</div>
	);

  // Form to enter domain name and data
	const renderInputForm = () =>{
    // If not on Polygon Mumbai Testnet, render the switch button
    if (network !== 'Polygon Mumbai Testnet') {
      return (
        <div className="connect-wallet-container">
          <h2>Please switch to Polygon Mumbai Testnet</h2>
          {/* This button will call our switch network function */}
          <button className='cta-button mint-button' onClick={switchNetwork}>Click here to switch</button>
        </div>
      );
    }

		return (
			<div className="form-container">
				<div className="first-row">
					<input
						type="text"
						value={domain}
						placeholder='domain'
						onChange={e => setDomain(e.target.value)}
					/>
					<p className='tld'> {tld} </p>
				</div>

        <h3>Optional</h3>
        <input
          type="text"
          value={superPwr}
          maxLength={20}
          placeholder='Whats ur super power?'
          onChange={e => setSuperPwr(e.target.value)}
        />
        
				<input
					type="text"
					value={avatar}
					placeholder='PFP (Paste OG image address)'
					onChange={e => setAvatar(e.target.value)}
				/>

        <input
					type="link"
					value={favNFT}
					placeholder='Link to ur fav NFT'
					onChange={e => setFavNFT(e.target.value)}
				/>

        <input
					type="text"
					value={discord}
					placeholder='Discord username'
					onChange={e => setDiscord(e.target.value)}
				/>

        <input
					type="text"
					value={twitter}
					placeholder='Twitter'
					onChange={e => setTwitter(e.target.value)}
				/>

        <input
					type="text"
					value={favSong}
					placeholder='Link to fav song or playlist'
					onChange={e => setFavSong(e.target.value)}
				/>

        
					{/* If the editing variable is true, return the "Set record" and "Cancel" button */}
					{editing ? (
						<div className="button-container">
							
							<button className='cta-button mint-button' disabled={loading} onClick={updateDomain}>
								Set Super power
							</button>  
				
							<button className='cta-button mint-button' onClick={() => {setEditing(false)}}>
								Cancel
							</button>  
						</div>
					) : (
						// If editing is not true, the mint button will be returned instead
						<button className='cta-button mint-button' disabled={loading} onClick={mintDomain}>
							Mint
						</button>  
					)}
			</div>
		);
	}

	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);


  // Add this render function next to your other render functions
const renderMints = () => {
	if (currentAccount && mints.length > 0) {
		return (
			<div className="mint-container">
				<p className="subtitle"> Recently minted domains!</p>
				<div className="mint-list">
					{ mints.map((mint, index) => {
						return (
							<div className="mint-item" key={index}>
								<div className='mint-row'>
									<a className="link" href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${mint.id}`} target="_blank" rel="noopener noreferrer">
										<p className="underlined">{' '}{mint.name}{tld}{' '}</p>
									</a>
									{/* If mint.owner is currentAccount, add an "edit" button*/}
									{ mint.owner.toLowerCase() === currentAccount.toLowerCase() ?
										<button className="edit-button" onClick={() => editRecord(mint.name)}>
											<img className="edit-icon" src="https://img.icons8.com/metro/26/000000/pencil.png" alt="Edit button" />
										</button>
										:
										null
									}
								</div>
					<p>Super Power: {mint.record} </p>
          <img alt="Mint owner's avatar" className="domainAvatar" src={mint.avatar}/>
				</div>)
				})}
			</div>
		</div>);
	}
};

// This will take us into edit mode and show us the edit buttons!
const editRecord = (name) => {
	console.log("Editing record for", name);
	setEditing(true);
	setDomain(name);
}

	return (
		<div className="App">
			<div className="container">
				<div className="header-container">
          <header>
            
            <div className="left">
              <p className="title">💰🍾 Cash Money Name Service</p>
              <p className="subtitle">If you get 💸 this is the Best API on the blockchain for you!</p>
            </div>
            {/* Display a logo and wallet connection status*/}
            <div className="right">
              <img alt="Network logo" className="logo" src={ network.includes("Polygon") ? polygonLogo : ethLogo} />
              { currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p> }
            </div>
          </header>
              <ToastContainer
                position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                />
          <div>
            <h3>Check out the transactions <a href={polygonScan} target="_blank">here</a> </h3>
          </div>
        </div>

				{!currentAccount && renderNotConnectedContainer()}
        {currentAccount && renderInputForm()}
        {mints && renderMints()}

				<div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={discordLogo} />
					<a
						className="footer-text"
						href={DISCORD_LINK}
						target="_blank"
						rel="noreferrer"
					>{" "} {"Join the Discord"}</a>
				</div>
			</div>
		</div>
	);
};

export default App;
