import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Extract parameters with defaults
  const title = searchParams.get('title') || 'Apps Dashboard';
  const description = searchParams.get('description') ||
    'A collection for me to collaborate with people and add new mini applications and useful AI tools!';

  // Always use white background theme
  const backgroundColor = '#FFFFFF';
  const textColor = '#000000';
  const borderColor = '#000000';
  const secondaryColor = '#666666';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: backgroundColor,
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          padding: '60px',
          fontFamily: 'monospace',
          position: 'relative',
        }}
      >
        {/* JD Logo in top left */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {/* JD Logo Box - Simplified */}
          <div
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: textColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `3px solid ${borderColor}`,
            }}
          >
            <div
              style={{
                color: backgroundColor,
                fontSize: '28px',
                fontWeight: 700,
                fontFamily: 'monospace',
                letterSpacing: '-2px',
              }}
            >
              JD
            </div>
          </div>

          <div
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: textColor,
              letterSpacing: '0.05em',
            }}
          >
            MINI PRODUCT SHOWCASE
          </div>
        </div>

        {/* Main Content Area */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            marginTop: '80px',
            marginBottom: '40px',
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 700,
              color: textColor,
              marginBottom: '24px',
              lineHeight: 1.1,
              maxWidth: '1000px',
              display: 'flex',
              flexWrap: 'wrap',
            }}
          >
            {title}
          </div>

          {/* Accent line */}
          <div
            style={{
              width: '200px',
              height: '4px',
              backgroundColor: textColor,
              marginBottom: '32px',
            }}
          />

          {/* Description */}
          <div
            style={{
              fontSize: '32px',
              color: secondaryColor,
              lineHeight: 1.5,
              maxWidth: '900px',
              fontWeight: 400,
            }}
          >
            {description}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: `2px solid ${borderColor}`,
            paddingTop: '24px',
          }}
        >
          <div
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: textColor,
              letterSpacing: '0.05em',
            }}
          >
            DARSH JOSHI
          </div>
          <div
            style={{
              fontSize: '18px',
              color: secondaryColor,
              fontFamily: 'monospace',
            }}
          >
            apps.darshjoshi.com
          </div>
        </div>

        {/* Corner accents - brutalist style */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderTop: `3px solid ${borderColor}`,
            borderRight: `3px solid ${borderColor}`,
            opacity: 0.3,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            width: '60px',
            height: '60px',
            borderBottom: `3px solid ${borderColor}`,
            borderLeft: `3px solid ${borderColor}`,
            opacity: 0.3,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
