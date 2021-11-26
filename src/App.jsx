import React,{useState,useEffect} from "react";
import { ethers } from "ethers";
import './App.css';
import contractJSON from './utils/WavePortal.json';

export default function App() {
  const METAMASK_NOT_INSTALLED_MESSAGE = "Metamask not detected. Please install it first.";
  const [waves,setWaves] = useState([]);
  const [isFetchingWaves,setIsFetchingWaves] = useState(false);
  const [isWaving,setIsWaving] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [isMetamaskInstalled,setIsMetamaskInstalled] = useState(false);
  const [waveMessage,setWaveMessage] = useState("");

  const contractAddress = "0x6e17246744b63977ef6dcDE1233A283BF5f14CCd";
  const contractABI = contractJSON.abi;

  const checkIfWalletIsConnected =async () => {
    try {
      
      if (!window.ethereum) return console.log("Make sure you have metamask!");
      setIsMetamaskInstalled(true);
      const { ethereum } = window;
      
      console.log("We have the ethereum object", ethereum);
      
      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const fetchWaves = async () => {
    console.log('fetching');
    try {
      setIsFetchingWaves(true);
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      let _waves = await wavePortalContract.getAllWaves();
      if (_waves.length === 0) return setIsFetchingWaves(false);
      setWaves(_waves.map((wave) => ({
        wavedBy:wave.wavedBy,
        createdAt:new Date(wave.createdAt * 1000),
        message:wave.message
      })));
      setIsFetchingWaves(false);
    } catch(error) {
      console.log(error);
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        await fetchWaves();
        console.log("Retrieved total wave count...",waves.length);

          setIsWaving(true);
          const waveTxn = await wavePortalContract.wave(waveMessage,{ gasLimit: 300000 });
          console.log("Mining...", waveTxn.hash);
          await waveTxn.wait();
          console.log("Mined -- ", waveTxn.hash);
          setIsWaving(false);

        await fetchWaves();
        console.log("Retrieved total wave count...",waves.length);
        setWaveMessage('');
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
      if (error.code === 4001) return setIsWaving(false);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }


  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  useEffect(() => {
    fetchWaves();
  },[currentAccount])
  useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, createdAt, message) => {
    console.log('NewWave', from, createdAt, message);
    setWaves(prevState => [
      ...prevState,
      {
        wavedBy:wave.wavedBy,
        createdAt:new Date(wave.createdAt * 1000),
        message:wave.message
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on('NewWave', onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off('NewWave', onNewWave);
    }
  };
}, []);
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        🇮🇩 Hi friends, waving you from Indonesia!🚀
        </div>

        <div className="bio">
       Gm, and Gn. I am Ricardo and I am making something in web3. Let's connect on <a href="https://twitter.com/RicardoSawir" target="_blank">Twitter</a> and <a href="https://github.com/sawirricardo" target="_blank">Github</a>. 
        Connect your Ethereum wallet and wave at me!
        <p>Also you can visit this <a href="https://rinkeby.etherscan.io/address/0x6e17246744b63977ef6dcDE1233A283BF5f14CCd" target="_blank">contract address</a> and <a href="https://github.com/sawirricardo/waveportal" target="_blank">web repo</a></p>
        </div>
{!isMetamaskInstalled && (<div className="bio">{METAMASK_NOT_INSTALLED_MESSAGE}</div>)}
{!currentAccount && (<div className="bio">Connect your wallet to rinkeby network first to see other's waves!</div>)}
{currentAccount !== '' && (<div >
  <div className="header">👋🏻 {" "}
  {isFetchingWaves && 'loading total waves...'}
  {!isFetchingWaves && waves.length}
  </div>
    <p className="bio">as of {new Date().toString()}</p>
      {!isFetchingWaves && waves.length > 0 && (
          <div style={{height:'250px',overflow:'auto'}}>
          {waves.map((wave,index) => (
            <div key={index}>
            <div style={{fontSize:'1.25rem'}}>👋🏻 {wave.message}</div>
            <small>{wave.wavedBy} - {wave.createdAt.toString()}</small>
            </div>
          ))}
          </div>
      )}
  </div>
)}

        
        {currentAccount && (<button className="waveButton" onClick={wave} disabled={isWaving}>
              {isWaving && '👋🏻 waving...wait why waving needs loading? 🤔'}
              {!isWaving && 'Wave at me ⭐️'}
        </button>)}
        {currentAccount  && (<textarea disabled={isWaving}rows={3} placeholder="you can say hi too, that would be great 😅" style={{padding:'1rem',margin:'1rem 0'}}
        onInput={(e) => setWaveMessage(e.target.value)}
        value={waveMessage}
        ></textarea>)}

        {isMetamaskInstalled && currentAccount === '' && (<button className="waveButton" onClick={connectWallet}>
          Connect my wallet.
        </button>)}
        { currentAccount  &&( 
          <div className="bio">Connected wallet: {currentAccount}</div>
          )}
          {currentAccount !== '' && (
            <div>
            {isFetchingWaves && (<div>Loading my waves...</div>)}
            {!isFetchingWaves && waves.filter((wave) => wave.wavedBy.toLowerCase() == currentAccount.toLowerCase()).length === 0 &&(
              <h3>Aww, It would be nice if you want to wave me 😁</h3>
            )}
              {!isFetchingWaves && waves.filter((wave) => wave.wavedBy.toLowerCase() == currentAccount.toLowerCase()).length > 0 && (<div>
              <h3>Thank you for waving me.</h3>
              <div>
                {waves.filter((wave) => wave.wavedBy.toLowerCase() == currentAccount.toLowerCase()).map((wave,index) => (
                  <div key={index}>
                    <details>
                      <summary>{wave.message}</summary>
                      <small>{wave.createdAt.toString()}</small>
                    </details>
                  </div>
                ))}
              </div>
              </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
