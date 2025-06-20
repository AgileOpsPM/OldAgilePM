// This is my dynamic file for all the basic reused codes

/*
//dynamic metadeta
export async function generateMetadata({ params }) {
    const { projectId } = params;
    return {
        title: `Project ${projectId}`, //project.title
        description: `Details of project ${projectId}`,
        keywords: `project, ${projectId}, nextjs`,
    };
}

//fetching data
export default function ProjectPage({ params }) {
    const { projectId } = params;

    return (
        <div>
            <h1>Project {projectId}</h1>
            <p>Details of project {projectId}</p>
            {/* Add more project details here *}/
            <QuantitySelector/> //this is how you add a feature from another page
        </div>
    );
}

//add to cart code
"use client"; //this is needed to use the state in the component
import {useState} from "react"; 

export default function AddToCart({productId}) {
    const [added, setAdded] = useState(false);

    const handleAddToCart = () => {
        // Logic to add the product to the cart
        setAdded(true);
        console.log(`Product ${productId} added to cart`);
    };

    return (
        <button onClick={handleAddToCart} disabled={added}>
            {added ? "Added to Cart" : "Add to Cart"}
        </button>
    );

//get function - fetch data from the server
async function fetchData() {
    const response = await fetch("https://localhost:3000/api/todoItem"),{
    method: "GET"
}),
    return response.json();
}

const Page = async () => {
    const data = await fetchData();

    //log data ot the server console
    console.log("Fetched data:", data);

    return (
        <div>
            <h1>Todo Items</h1>
        </div>
);
}      

async function postData() {
const response = await fetch("https://localhost:3000/api/todoItem", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },

//post function - add data to the server
export async function POST(request) {
    const body = await request.json();

    const res = await fetch("https://localhost:3000/api/todoItem", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        const todoItem = await res.json();
    });
// This is a dynamic file that can be used to handle various functionalities like metadata generation, data fetching, and more.
// It can be used in different parts of the application to keep the code DR

const Page = ({params:{params: {id: string}}}) => {
  const { id } = params;

  return (
    <h1 className="text-3xl">User detail page: {:id}</h1>
  )
}

export default Page

*/