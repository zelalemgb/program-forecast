import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { Button } from "@/components/ui/button";

type Props = {
  onResult: (text: string) => void;
  onError?: (err: unknown) => void;
};

const BarcodeScanner: React.FC<Props> = ({ onResult, onError }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [active, setActive] = useState(false);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
    return () => {
      controlsRef.current?.stop();
    };
  }, []);

  const start = async () => {
    try {
      setActive(true);
      const reader = readerRef.current!;
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const deviceId = devices?.[0]?.deviceId;
      if (!deviceId) throw new Error("No camera found");
      controlsRef.current = await reader.decodeFromVideoDevice(deviceId, videoRef.current!, (result, err) => {
        if (result) {
          onResult(result.getText());
        }
        if (err && onError) onError(err);
      });
    } catch (e) {
      setActive(false);
      onError?.(e);
    }
  };

  const stop = () => {
    controlsRef.current?.stop();
    setActive(false);
  };

  return (
    <div className="space-y-2">
      <div className="rounded-md overflow-hidden border">
        <video ref={videoRef} className="w-full aspect-video" muted playsInline />
      </div>
      <div className="flex gap-2">
        {!active ? (
          <Button onClick={start}>Start Scanner</Button>
        ) : (
          <Button variant="secondary" onClick={stop}>Stop</Button>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;
