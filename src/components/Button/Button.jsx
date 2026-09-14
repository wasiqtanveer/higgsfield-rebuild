import { Link } from "react-router-dom";
import "./Button.css";

/**
 * One button, three weights. Renders as <a>, <Link> or <button> depending on
 * what it actually does -- a thing that navigates must be a link, so it opens
 * in a new tab, shows a URL on hover, and works for assistive tech.
 */
export default function Button({
  variant = "primary",
  size = "md",
  to,
  href,
  children,
  className = "",
  ...rest
}) {
  const cls = `btn btn--${variant} btn--${size} ${className}`.trim();

  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{children}</a>;
  return <button className={cls} {...rest}>{children}</button>;
}
