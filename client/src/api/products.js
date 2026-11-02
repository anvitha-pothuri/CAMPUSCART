
import API from "./axios";

export const getProducts = async (filters = {}) => {
    const response = await API.get("/products", {
        params: filters
    });

    return (response.data.products || []).map((product) => ({
        id: product._id,
        name: product.title,
        title: product.title,
        description: product.description || "No description provided.",
        category: product.category,
        price: product.price,
        condition: product.condition,
        images: product.images || [],
        image: product.images?.[0] || "",
        seller: product.seller || null
    }));
};
