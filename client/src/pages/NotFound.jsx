import { Link } from "react-router-dom";

export default function NotFound() {
  return(
    <>
      <div className="flex flex-col justify-center items-center">
        <h1>404 NOT FOUND</h1>
        <Link to="/">Home</Link>
      </div>
    </>
  )
}