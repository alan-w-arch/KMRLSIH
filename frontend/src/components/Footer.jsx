export default function Footer() {
  return (
    <footer className="fixed bottom-0  left-0 w-full bg-gray-100 p-4 text-center shadow-inner z-30">
      <p>&copy; {new Date().getFullYear()} My App. All rights reserved.</p>
    </footer>
  );
}
