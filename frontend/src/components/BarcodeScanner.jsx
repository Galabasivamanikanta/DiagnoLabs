import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';

const BarcodeScanner = ({ onScanSuccess, onClose }) => {
    const scannerRef = useRef(null);
    const [error, setError] = useState('');

    useEffect(() => {
        // Initialize scanner
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 150 },
                supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                rememberLastUsedCamera: true,
                aspectRatio: 1.0
            },
            false
        );

        const onScanSuccessLocal = (decodedText) => {
            scanner.clear();
            onScanSuccess(decodedText);
        };

        const onScanFailure = (err) => {
            // Usually just background noise, ignore
        };

        scanner.render(onScanSuccessLocal, onScanFailure);
        scannerRef.current = scanner;

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.error(e));
            }
        };
    }, [onScanSuccess]);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '400px',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', color: 'var(--text-main)' }}>
                        <Camera size={18} style={{ color: 'var(--primary)' }} /> Scan Vial Barcode
                    </div>
                    <button onClick={onClose} style={{
                        background: 'var(--surface-alt)', border: '1px solid var(--border)', color: 'var(--text-main)',
                        borderRadius: '10px', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center'
                    }}>
                        <X size={16} />
                    </button>
                </div>

                <div id="reader" style={{ width: '100%', borderRadius: '10px', overflow: 'hidden' }}></div>
                
                {error && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '1rem', textAlign: 'center', fontWeight: '600' }}>{error}</div>}

                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Position the barcode or QR code inside the box to scan automatically.
                </div>
            </div>
        </div>
    );
};

export default BarcodeScanner;
