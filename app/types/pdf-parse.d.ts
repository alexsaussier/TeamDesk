declare module 'pdf-parse/lib/pdf-parse' {
  function pdf(buffer: Buffer): Promise<{ text: string }>;
  export default pdf;
} 