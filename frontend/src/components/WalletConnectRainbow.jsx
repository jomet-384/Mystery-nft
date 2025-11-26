// RainbowKit Wallet Connect Component
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function WalletConnectRainbow() {
  return (
    <div className="wallet-connect-rainbow">
      <ConnectButton
        chainStatus="icon"
        showBalance={false}
      />
    </div>
  );
}
