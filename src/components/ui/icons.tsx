import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

const createIcon = (name: string, path: React.ReactNode) => {
  const IconComponent: React.FC<IconProps> = ({ size, style, className, ...props }) => {
    const fontSize = typeof style?.fontSize === 'number' ? `${style.fontSize}px` : style?.fontSize;
    const finalSize = size || fontSize || '20px';

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width={finalSize}
        height={finalSize}
        className={className}
        style={style}
        aria-hidden="true"
        {...props}
      >
        {path}
      </svg>
    );
  };
  IconComponent.displayName = name;
  return IconComponent;
};

// --- Exact Google Material Rounded Icon Paths ---

export const CheckCircleOutlineRounded = createIcon(
  'CheckCircleOutlineRounded',
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58a.996.996 0 10-1.41 1.41l3.3 3.29c.39.39 1.02.39 1.41 0l7.3-7.29a.996.996 0 10-1.42-1.42z" />
);

export const CheckCircleRounded = createIcon(
  'CheckCircleRounded',
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-4-4a.996.996 0 111.41-1.41L10 14.17l6.59-6.59a.996.996 0 111.41 1.41L10 17z" />
);

export const RepeatRounded = createIcon(
  'RepeatRounded',
  <path d="M7 7h10v1.79c0 .45.54.67.85.35l2.79-2.79c.2-.2.2-.51 0-.71l-2.79-2.79a.5.5 0 00-.85.35V5H6c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1V7zm10 10H7v-1.79c0-.45-.54-.67-.85-.35l-2.79 2.79c-.2.2-.2.51 0 .71l2.79 2.79c.31.31.85.09.85-.35V19h11c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1s-1 .45-1 1v3z" />
);

export const AutoAwesomeRounded = createIcon(
  'AutoAwesomeRounded',
  <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
);

export const SpaOutlined = createIcon(
  'SpaOutlined',
  <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.39-1.39C8.68 19.63 10.27 20 12 20s3.32-.37 4.84-1.02l1.43 1.43c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-.66-.66C20.26 16.79 21 14.53 21 12c0-4.97-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6 0-1.41.49-2.7 1.31-3.73l1.45 1.45c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L8.73 6.87C9.7 6.32 10.81 6 12 6s2.3.32 3.27.87l-1.45 1.45c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.45-1.45C17.51 9.3 18 10.59 18 12c0 3.31-2.69 6-6 6z" />
);

export const SpaRounded = createIcon(
  'SpaRounded',
  <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.39-1.39C8.68 19.63 10.27 20 12 20s3.32-.37 4.84-1.02l1.43 1.43c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-.66-.66C20.26 16.79 21 14.53 21 12c0-4.97-4.03-9-9-9zm-1.05 13.91C7.81 16.29 6 13.92 6 11.2c0-2.38 1.46-4.57 3.86-5.83l.89.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-.89-.89C11.53 3.97 12 3.97 12.27 4c2.4 1.26 3.86 3.45 3.86 5.83 0 2.72-1.81 5.09-4.95 5.71l-.23.37z" />
);

export const PsychologyOutlined = createIcon(
  'PsychologyOutlined',
  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46A5.926 5.926 0 0112 6c2.81 0 5.16 1.94 5.82 4.56.15.6.61 1.07 1.22 1.2 1.7.37 2.96 1.9 2.96 3.74 0 2.21-1.79 4-4 4h-1v-2c0-.55-.45-1-1-1h-2v-2c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v1.17l-2-2V13c0-1.66 1.34-3 3-3 .55 0 1-.45 1-1s-.45-1-1-1c-2.76 0-5 2.24-5 5 0 1.12.37 2.16 1 3v2.59c0 .53.21 1.04.59 1.41L8 22h7c3.31 0 6-2.69 6-6 0-2.97-2.16-5.43-4.65-5.96z" />
);

export const TuneRounded = createIcon(
  'TuneRounded',
  <path d="M3 18c0 .55.45 1 1 1h5c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1zm0-6c0 .55.45 1 1 1h11c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1zm0-6c0 .55.45 1 1 1h5c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1zm10 13c.55 0 1-.45 1-1v-1h6c.55 0 1-.45 1-1s-.45-1-1-1h-6v-1c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1zm6-6c.55 0 1-.45 1-1s-.45-1-1-1h-1V7c0-.55-.45-1-1-1s-1 .45-1 1v4h-4c-.55 0-1 .45-1 1s.45 1 1 1h7zm-6-6c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1v1h-6c-.55 0-1 .45-1 1s.45 1 1 1h6v1c0 .55.45 1 1 1z" />
);

export const BarChartRounded = createIcon(
  'BarChartRounded',
  <path d="M6 20c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2s-2 .9-2 2v4c0 1.1.9 2 2 2zm6 0c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2s-2 .9-2 2v12c0 1.1.9 2 2 2zm6 0c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2s-2 .9-2 2v9c0 1.1.9 2 2 2z" />
);

export const EditRounded = createIcon(
  'EditRounded',
  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
);

export const EditOutlined = EditRounded;

export const LocalFireDepartmentRounded = createIcon(
  'LocalFireDepartmentRounded',
  <path d="M19.48 12.35c-1.57-4.08-7.16-4.3-5.81-10.23.1-.44-.34-.81-.74-.63-3.66 1.63-7.53 5.4-7.53 10.37 0 4.14 3.36 7.5 7.5 7.5s7.5-3.36 7.5-7.5c0-.68-.1-1.34-.28-1.97-.13-.47-.64-.67-.94-.34-.41.44-.88.82-1.39 1.13-.5.31-1.07-.15-.9-.72.26-.88.4-1.81.4-2.77 0-1.19-.24-2.33-.67-3.37-.17-.42-.71-.52-.98-.18-1.42 1.77-2.34 3.96-2.51 6.36-.04.53-.53.92-1.05.81-.43-.09-.72-.48-.68-.92.21-2.48 1.25-4.73 2.85-6.43.34-.36.21-.95-.27-1.14-1.28-.5-2.67-.32-3.83.47-1.74 1.18-2.88 3.16-2.88 5.4 0 3.31 2.69 6 6 6s6-2.69 6-6c0-1.02-.26-1.99-.71-2.83-.24-.46-.08-1.03.35-1.29.35-.21.81-.13 1.05.21.73 1.03 1.17 2.27 1.17 3.61 0 4.97-4.03 9-9 9s-9-4.03-9-9c0-5.32 4.1-9.61 9.09-11.23.51-.17 1.03.22.95.75-.43 2.84.44 5.37 2.45 7.08.38.33.95.2 1.16-.27.27-.6.41-1.26.41-1.95 0-.58-.1-1.13-.28-1.65-.18-.51.27-.99.78-.85 1.54.42 2.89 1.34 3.86 2.58.33.42.17 1.04-.3 1.26-.41.19-.78.44-1.11.74-.4.36-.45.97-.09 1.37.36.4.97.45 1.37.09z" />
);

export const BoltRounded = createIcon(
  'BoltRounded',
  <path d="M11 21c-.4 0-.77-.24-.92-.62-.21-.54.06-1.14.6-1.35L14.7 13H9c-.45 0-.85-.27-.99-.69-.14-.42-.01-.89.33-1.17l8-6.5c.44-.36 1.07-.31 1.45.12.38.43.37 1.07-.02 1.48L13.3 11H19c.45 0 .85.27.99.69.14.42.01.89-.33 1.17l-8 6.5c-.2.16-.43.24-.66.24z" />
);

export const NotificationsActiveRounded = createIcon(
  'NotificationsActiveRounded',
  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-1.29 1.29c-.63.63-.19 1.71.7 1.71h13.17c.89 0 1.34-1.08.71-1.71L18 16zm-3.02-12.08a.996.996 0 00-.09-1.41C13.62 1.45 12.36 1 11 1s-2.62.45-3.89 1.51a.996.996 0 101.32 1.5C9.28 3.3 10.11 3 11 3s1.72.3 2.57 1.01c.42.35 1.05.31 1.41-.09z" />
);

export const NotificationsActiveOutlined = NotificationsActiveRounded;
export const NotificationsNoneRounded = NotificationsActiveRounded;

export const PlayArrowRounded = createIcon(
  'PlayArrowRounded',
  <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z" />
);

export const PauseRounded = createIcon(
  'PauseRounded',
  <path d="M8 19c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2v10c0 1.1.9 2 2 2zm6-12v10c0 1.1.9 2 2 2s2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2z" />
);

export const PauseCircleOutlineRounded = PauseRounded;

export const TimerOutlined = createIcon(
  'TimerOutlined',
  <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0012 4c-4.97 0-9 4.03-9 9s4.02 9 9 9a8.994 8.994 0 007.03-14.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
);

export const MoreTimeRounded = createIcon(
  'MoreTimeRounded',
  <path d="M10 8v6l4.7 2.9.8-1.2-4-2.4V8zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.2 0 2.3-.2 3.4-.6-.4-.6-.7-1.3-.9-2-.8.4-1.6.6-2.5.6-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8c0 .9-.2 1.7-.6 2.5.7.2 1.4.5 2 .9.4-1.1.6-2.2.6-3.4 0-5.5-4.5-10-10-10zm8 14v3h3v2h-3v3h-2v-3h-3v-2h3v-3h2z" />
);

export const SwapHorizRounded = createIcon(
  'SwapHorizRounded',
  <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
);

export const BlockRounded = createIcon(
  'BlockRounded',
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z" />
);

export const LightbulbOutlined = createIcon(
  'LightbulbOutlined',
  <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-1.3l-.85-.6C7.8 13.16 7 11.18 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.18-.8 4.16-2.15 5.1z" />
);

export const RestartAltRounded = createIcon(
  'RestartAltRounded',
  <path d="M12 5V2L8 6l4 4V7c3.31 0 6 2.69 6 6 0 2.97-2.17 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93 0-4.42-3.58-8-8-8zm-6 8c0-1.65.67-3.15 1.76-4.24l-1.42-1.42C4.88 8.79 4 10.79 4 13c0 4.08 3.05 7.44 7 7.93v-2.02C8.17 18.43 6 15.97 6 13z" />
);

export const WbTwilightRounded = createIcon(
  'WbTwilightRounded',
  <path d="M20 15.31l1.41-1.41a.996.996 0 10-1.41-1.41l-1.41 1.41c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0zM12 7c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1s-1 .45-1 1v3c0 .55.45 1 1 1zM4 15.31c.39.39 1.02.39 1.41 0l1.41-1.41a.996.996 0 10-1.41-1.41L4 13.9c-.39.39-.39 1.02 0 1.41zM2 19h20v2H2zM12 9c-3.87 0-7 3.13-7 7h14c0-3.87-3.13-7-7-7z" />
);

export const NightlightRound = createIcon(
  'NightlightRound',
  <path d="M15.5 22c1.05 0 2.05-.16 3-.46-4.06-1.27-7-5.06-7-9.54s2.94-8.27 7-9.54C17.55 2.16 16.55 2 15.5 2 9.7 2 5 6.7 5 12.5S9.7 22 15.5 22z" />
);

export const IosShareRounded = createIcon(
  'IosShareRounded',
  <path d="M18 8h-3c-.55 0-1 .45-1 1s.45 1 1 1h3v11H6V10h3c.55 0 1-.45 1-1s-.45-1-1-1H6c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6.71-6.71a.996.996 0 001.41 0l3.59 3.59a.996.996 0 101.41-1.41l-4.59-4.59c-.39-.39-1.02-.39-1.41 0l-4.59 4.59a.996.996 0 101.41 1.41l3.59-3.59zM12 15c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1s-1 .45-1 1v11c0 .55.45 1 1 1z" />
);

export const SettingsBackupRestoreRounded = createIcon(
  'SettingsBackupRestoreRounded',
  <path d="M14 12c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-2-9a9 9 0 00-6.36 2.64L4 4v5h5L7.05 7.05A7.004 7.004 0 0119 12c0 3.87-3.13 7-7 7s-7-3.13-7-7H3c0 4.97 4.03 9 9 9s9-4.03 9-9-4.03-9-9-9z" />
);

export const LanguageRounded = createIcon(
  'LanguageRounded',
  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 00-1.38-3.56A8.03 8.03 0 0118.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 015.08 16zm2.95-8H5.08a7.987 7.987 0 014.33-3.56A15.65 15.65 0 008.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.78 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 01-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z" />
);

export const BatteryAlertRounded = createIcon(
  'BatteryAlertRounded',
  <path d="M15.67 4H14V3c0-.55-.45-1-1-1h-2c-.55 0-1 .45-1 1v1H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM13 18h-2v-2h2v2zm0-4h-2V9h2v5z" />
);

export const PaletteOutlined = createIcon(
  'PaletteOutlined',
  <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.39-1.39C8.68 19.63 10.27 20 12 20c4.97 0 9-4.03 9-9 0-4.97-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-5.5-6c.83 0 1.5-.67 1.5-1.5S7.33 9 6.5 9 5 9.67 5 10.5 5.67 12 6.5 12zm3-4C10.33 8 11 7.33 11 6.5S10.33 5 9.5 5 8 5.67 8 6.5 8.67 8 9.5 8zm5 0c.83 0 1.5-.67 1.5-1.5S15.33 5 14.5 5 13 5.67 13 6.5s.67 1.5 1.5 1.5zm3 4c.83 0 1.5-.67 1.5-1.5S18.33 9 17.5 9 16 9.67 16 10.5s.67 1.5 1.5 1.5z" />
);

export const CheckRounded = createIcon(
  'CheckRounded',
  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
);

export const UndoRounded = createIcon(
  'UndoRounded',
  <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
);

export const AddCircleOutlineRounded = createIcon(
  'AddCircleOutlineRounded',
  <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
);

export const CloseRounded = createIcon(
  'CloseRounded',
  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
);

export const ChevronLeftRounded = createIcon(
  'ChevronLeftRounded',
  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
);

export const ChevronRightRounded = createIcon(
  'ChevronRightRounded',
  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
);

export const ArrowForwardRounded = createIcon(
  'ArrowForwardRounded',
  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
);

export const ArrowBackRounded = createIcon(
  'ArrowBackRounded',
  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
);

export const FilterListRounded = createIcon(
  'FilterListRounded',
  <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
);

export const StarRounded = createIcon(
  'StarRounded',
  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
);

export const StarOutlineRounded = createIcon(
  'StarOutlineRounded',
  <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z" />
);

export const ArrowCircleUpRounded = createIcon(
  'ArrowCircleUpRounded',
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-8h3l-4-4-4 4h3v4h2v-4z" />
);

export const LayersOutlined = createIcon(
  'LayersOutlined',
  <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z" />
);

export const CloudOffRounded = createIcon(
  'CloudOffRounded',
  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46A5.926 5.926 0 0112 6c2.81 0 5.16 1.94 5.82 4.56.15.6.61 1.07 1.22 1.2 1.7.37 2.96 1.9 2.96 3.74 0 2.21-1.79 4-4 4h-1v-2c0-.55-.45-1-1-1h-2v-2c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v1.17l-2-2V13c0-1.66 1.34-3 3-3 .55 0 1-.45 1-1s-.45-1-1-1c-2.76 0-5 2.24-5 5 0 1.12.37 2.16 1 3v2.59c0 .53.21 1.04.59 1.41L8 22h7c3.31 0 6-2.69 6-6 0-2.97-2.16-5.43-4.65-5.96z" />
);

export const AddRounded = createIcon(
  'AddRounded',
  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
);
