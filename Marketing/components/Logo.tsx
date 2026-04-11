export default function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Curly triangle — equilateral triangle with curved concave sides */}
      <path
        d="M14 2C16.5 8.5 24.5 10 26 14C27.5 18 22 24.5 18 25.5C14 26.5 8 26.5 4 25.5C0 24.5 -1 18 2 14C5 10 11.5 8.5 14 2Z"
        fill="#0a0a0a"
      />
    </svg>
  );
}
