export default function Footer() {
  return (
    <footer
      className="
        fixed bottom-4 left-4 right-4
        bg-gray-50 backdrop-blur-xl
        rounded-2xl
        p-2 text-center
        z-30
      "
    >
      <p className="text-sm text-gray-700">
        © {new Date().getFullYear()} KMRLSIH — Team Code Terrors
      </p>
    </footer>
  );
}
