import Link from "next/link"

const Page = () => {
  return (
    <div>
        <h1>Dashboard Users Page</h1>

        <ul className="mt-10">
            <li><link href="/dashboard/users/1"></link>User 1</li>
            <li><link href="/dashboard/users/2"></link>User 2</li>
            <li><link href="/dashboard/users/3"></link>User 3</li>
            <li><link href="/dashboard/users/4"></link>User 4</li>
        </ul>
    </div>
  )
}

export default Page
