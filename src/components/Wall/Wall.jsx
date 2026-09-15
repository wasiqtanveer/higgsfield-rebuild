import "./Wall.css";

/**
 * Masonry column wall.
 *
 * CSS columns rather than a row-span grid: the tiles have no common row unit,
 * and faking one forces every clip into a multiple of some arbitrary height.
 * Columns let each tile keep its own aspect ratio, which is the point -- a wall
 * of identically proportioned video reads as a contact sheet, not as work.
 *
 * Order runs down each column rather than across, which is the one thing
 * columns cost. Acceptable for a gallery with no sequence; it would not be for
 * a feed with one.
 */
export default function Wall({ children, columns = 5, className = "" }) {
  return (
    <div className={`wall ${className}`.trim()} style={{ "--cols": columns }}>
      {children}
    </div>
  );
}
