import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'HIPAA Hub — HIPAA Compliance Platform for Private Practices';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0e274e',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '80px',
        }}
      >
        {/* Logo row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '36px',
          }}
        >
          {/* Shield icon */}
          <div
            style={{
              background: '#00bceb',
              width: '72px',
              height: '72px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              color: 'white',
              fontWeight: 700,
            }}
          >
            H
          </div>
          <span
            style={{
              color: 'white',
              fontSize: '56px',
              fontWeight: 700,
              letterSpacing: '-1px',
            }}
          >
            HIPAA Hub
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            color: '#00bceb',
            fontSize: '28px',
            fontWeight: 400,
            textAlign: 'center',
            maxWidth: '760px',
            lineHeight: 1.4,
            marginBottom: '40px',
          }}
        >
          HIPAA Compliance Platform for Private Practices
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {[
            'Risk Assessment',
            'Policies',
            'BAA Tracker',
            'Breach Response',
            'Staff Training',
          ].map((feat) => (
            <div
              key={feat}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '999px',
                color: 'rgba(255,255,255,0.75)',
                fontSize: '16px',
                padding: '8px 20px',
              }}
            >
              {feat}
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            color: 'rgba(255,255,255,0.35)',
            fontSize: '14px',
          }}
        >
          hipaahubhealth.com
        </div>
      </div>
    ),
    { ...size }
  );
}
