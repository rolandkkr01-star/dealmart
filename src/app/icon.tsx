import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: '#F1B20B',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          color: '#1D2129',
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1D2129"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="8.5" cy="20.5" r="1.75" fill="#1D2129" />
          <circle cx="18.5" cy="20.5" r="1.75" fill="#1D2129" />
          <path d="M1.5 1.5h3.5l2.4 12.2a2 2 0 0 0 1.95 1.6h9.8a2 2 0 0 0 1.95-1.55L23 5.5H5.8" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
