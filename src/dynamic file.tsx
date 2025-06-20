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
*/