
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");

const demoSeller = {
    fullName: "CAMPUSCART Demo Store",
    email: "demo.seller@campuscart.local",
    password: "DemoSeller@123",
    role: "seller",
    isEmailVerified: true
};

const demoProducts = [
    // TEXTBOOKS
    {
        title: "Engineering Mathematics Textbook",
        description: "Engineering mathematics textbook covering calculus, matrices and differential equations.",
        price: 280,
        category: "Textbooks",
        condition: "Good",
        images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlLyMDaBl7qowQ6-JzlixLRnRlgO99axhp78RhbtahTQ&s=10"]
    },
    {
        title: "Data Structures and Algorithms",
        description: "Learn arrays, linked lists, trees, graphs and algorithms with this student-friendly textbook.",
        price: 350,
        category: "Textbooks",
        condition: "Like New",
        images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuKgaL3tk5x13qv4v1ZcvC8JetK8s5G2lEpf3yplbYzQ&s=10"]
    },
    {
        title: "Operating Systems Textbook",
        description: "Reference book covering processes, memory management and operating system concepts.",
        price: 300,
        category: "Textbooks",
        condition: "Good",
        images: ["https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQc1QSjdexpo4M0lxy19ES3YQmQEz4copd7sTnQh_fJC5Fx9-MvVDIL3GIdcdzsi7rzqaS4wdtKRv30cHlMO-vVDWH-jMsUvoE-ugbPVPSi31PXQaZdKHEM"]
    },
    {
        title: "Database Management Systems",
        description: "Useful DBMS textbook covering SQL, normalization and database design.",
        price: 320,
        category: "Textbooks",
        condition: "Like New",
        images: ["https://m.media-amazon.com/images/I/81i4pigaqeL.jpg"]
    },
    {
        title: "Computer Networks Book",
        description: "Networking concepts, protocols, TCP/IP and network security for engineering students.",
        price: 260,
        category: "Textbooks",
        condition: "Good",
        images: ["https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQmW10y7rsJLgjM24dCHD9Y_MqTeIKPC_UIMcBaVTuo4wL3NWQEHtIwgnGqP8JgwSAZGDZeMg_RfCBWrvUSTkh2mhYwmb1XJOYNakAFvYDelOhkxzbd7ozK"]
    },

    // CALCULATORS - calculator photos only
    {
        title: "Scientific Calculator",
        description: "Scientific calculator suitable for engineering calculations and examinations.",
        price: 200,
        category: "Calculators",
        condition: "Good",
        images: ["https://images.pexels.com/photos/12174065/pexels-photo-12174065.jpeg"]
    },
    {
        title: "Casio Style Scientific Calculator",
        description: "Multi-function scientific calculator for mathematics and engineering subjects.",
        price: 550,
        category: "Calculators",
        condition: "Like New",
        images: ["https://images.pexels.com/photos/220301/pexels-photo-220301.jpeg"]
    },
    {
        title: "Basic Digital Calculator",
        description: "Compact calculator for everyday calculations and classroom use.",
        price: 150,
        category: "Calculators",
        condition: "Good",
        images: ["https://images.pexels.com/photos/8250936/pexels-photo-8250936.jpeg"]
    },
    {
        title: "Advanced Scientific Calculator",
        description: "Advanced calculator with multiple scientific and mathematical functions.",
        price: 650,
        category: "Calculators",
        condition: "Like New",
        images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_2MgNz_1MTcUIyrCPzj_pqmos1SzmxGSqI9K1RErnNw&s=10"]
    },
    {
        title: "Pocket Student Calculator",
        description: "Lightweight calculator that fits easily into a college bag.",
        price: 180,
        category: "Calculators",
        condition: "Good",
        images: ["https://images.pexels.com/photos/36488453/pexels-photo-36488453.jpeg"]
    },

    // LAB COATS - lab coat photos only
    {
        title: "White Laboratory Coat",
        description: "White full-sleeve laboratory coat suitable for college practical sessions.",
        price: 320,
        category: "Lab Coats",
        condition: "Like New",
        images: ["https://images.pexels.com/photos/8442638/pexels-photo-8442638.jpeg"]
    },
    {
        title: "Cotton Lab Coat",
        description: "Comfortable cotton laboratory coat for regular college laboratory use.",
        price: 380,
        category: "Lab Coats",
        condition: "New",
        images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQP_1S1oZVOENWs6mG4OP6Qy-Sit6q6WLV1foJLPTXk5A&s=10"]
    },
    {
        title: "Student Lab Coat - Medium",
        description: "Medium-size white lab coat with front buttons and practical pockets.",
        price: 250,
        category: "Lab Coats",
        condition: "Good",
        images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT98fz1vPH_LBCbMdeYBlwcXNOoi3_qF-Rn6UkbGYoyhQ&s=10"]
    },
    {
        title: "Premium White Lab Coat",
        description: "Full-length laboratory coat suitable for science and pharmacy students.",
        price: 450,
        category: "Lab Coats",
        condition: "New",
        images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHqsmgzfF3uxbYN8zlC9pODHnRqM77O-jfB74KLSO_7g&s=10"]
    },
    {
        title: "Short Laboratory Coat",
        description: "Lightweight short lab coat for everyday practical classes.",
        price: 280,
        category: "Lab Coats",
        condition: "Like New",
        images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbAaC89C4adkHwt11gagkeVl8ipztD4Mz9KCv_h2dGLA&s=10"]
    },

    // ELECTRONICS
    {
        title: "Wireless Headphones",
        description: "Comfortable headphones for online classes, music and study sessions.",
        price: 699,
        category: "Electronics",
        condition: "Good",
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"]
    },
    {
        title: "Wireless Bluetooth Earbuds",
        description: "Compact wireless earbuds with a charging case.",
        price: 599,
        category: "Electronics",
        condition: "Like New",
        images: ["https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800"]
    },
    {
        title: "USB Keyboard",
        description: "Standard USB keyboard for laptops and desktop computers.",
        price: 350,
        category: "Electronics",
        condition: "Good",
        images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800"]
    },
    {
        title: "Wireless Computer Mouse",
        description: "Ergonomic wireless mouse for everyday college and computer work.",
        price: 250,
        category: "Electronics",
        condition: "Like New",
        images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800"]
    },
    {
        title: "Portable Bluetooth Speaker",
        description: "Compact portable speaker with wireless connectivity.",
        price: 750,
        category: "Electronics",
        condition: "Good",
        images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800"]
    },

    // STATIONERY
    {
        title: "Student Stationery Combo",
        description: "Pens, pencils, ruler and everyday stationery essentials.",
        price: 149,
        category: "Stationery",
        condition: "New",
        images: ["https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800"]
    },
    {
        title: "Premium Notebook Set",
        description: "Set of ruled notebooks for class notes and assignments.",
        price: 180,
        category: "Stationery",
        condition: "New",
        images: ["https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800"]
    },
    {
        title: "Color Pen Set",
        description: "Multicolor pens for notes, diagrams and creative work.",
        price: 120,
        category: "Stationery",
        condition: "New",
        images: ["https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800"]
    },
    {
        title: "Geometry Box",
        description: "Complete geometry set with compass, ruler and other essentials.",
        price: 90,
        category: "Stationery",
        condition: "Like New",
        images: ["https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800"]
    },
    {
        title: "Sticky Notes and Highlighters",
        description: "Colorful sticky notes and highlighters for study organization.",
        price: 130,
        category: "Stationery",
        condition: "New",
        images: ["https://images.unsplash.com/photo-1453738773917-9c3eff1db985?w=800"]
    },

    // STORY BOOKS
    {
        title: "Classic Story Book Set",
        description: "A collection of interesting story books for leisure reading.",
        price: 220,
        category: "Story Books",
        condition: "Good",
        images: ["https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800"]
    },
    {
        title: "The Alchemist",
        description: "Popular fiction novel about dreams, journeys and discovering your purpose.",
        price: 180,
        category: "Story Books",
        condition: "Like New",
        images: ["https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800"]
    },
    {
        title: "Mystery Stories Collection",
        description: "A collection of mystery and adventure stories.",
        price: 200,
        category: "Story Books",
        condition: "Good",
        images: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800"]
    },
    {
        title: "Short Stories for Students",
        description: "Easy-to-read short stories for everyday reading.",
        price: 120,
        category: "Story Books",
        condition: "Good",
        images: ["https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800"]
    },
    {
        title: "Fantasy Novel Collection",
        description: "Fantasy and adventure novels for readers who enjoy imaginative stories.",
        price: 300,
        category: "Story Books",
        condition: "Like New",
        images: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800"]
    },

    // LAB EQUIPMENT
    {
        title: "Basic Lab Equipment Kit",
        description: "Educational laboratory kit for student practical work.",
        price: 550,
        category: "Lab Equipment",
        condition: "Like New",
        images: ["https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800"]
    },
    {
        title: "Laboratory Safety Goggles",
        description: "Protective safety goggles for chemistry and science laboratory sessions.",
        price: 120,
        category: "Lab Equipment",
        condition: "New",
        images: ["https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800"]
    },
    {
        title: "Microscope Slides Set",
        description: "Glass microscope slides for biology practical sessions.",
        price: 180,
        category: "Lab Equipment",
        condition: "New",
        images: ["https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800"]
    },
    {
        title: "Laboratory Measuring Beaker",
        description: "Graduated measuring beaker for laboratory experiments.",
        price: 150,
        category: "Lab Equipment",
        condition: "Good",
        images: ["https://images.unsplash.com/photo-1581093458791-9d42e3c4e5c4?w=800"]
    },
    {
        title: "Student Chemistry Lab Kit",
        description: "Basic educational chemistry practical equipment kit.",
        price: 480,
        category: "Lab Equipment",
        condition: "Like New",
        images: ["https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800"]
    },

    // PROJECT MATERIALS
    {
        title: "College Project Materials Kit",
        description: "Craft and project materials for college assignments.",
        price: 199,
        category: "Project Materials",
        condition: "New",
        images: ["https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800"]
    },
    {
        title: "Arduino Starter Project Kit",
        description: "Beginner electronics project kit for learning microcontrollers.",
        price: 650,
        category: "Project Materials",
        condition: "Like New",
        images: ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"]
    },
    {
        title: "Chart Paper and Craft Set",
        description: "Colorful chart papers and craft materials for college presentations.",
        price: 120,
        category: "Project Materials",
        condition: "New",
        images: ["https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800"]
    },
    {
        title: "Science Exhibition Model Kit",
        description: "Materials for creating science exhibition and academic models.",
        price: 350,
        category: "Project Materials",
        condition: "New",
        images: ["https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800"]
    },
    {
        title: "DIY Robotics Project Kit",
        description: "Educational robotics components for student mini projects.",
        price: 799,
        category: "Project Materials",
        condition: "Like New",
        images: ["https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800"]
    },

    // OTHER
    {
        title: "USB Study Desk Lamp",
        description: "Compact desk lamp for reading and studying.",
        price: 299,
        category: "Other",
        condition: "Like New",
        images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800"]
    },
    {
        title: "College Backpack",
        description: "Spacious backpack for carrying books, notebooks and laptops.",
        price: 499,
        category: "Other",
        condition: "Good",
        images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"]
    },
    {
        title: "Insulated Water Bottle",
        description: "Reusable water bottle for everyday college use.",
        price: 220,
        category: "Other",
        condition: "New",
        images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800"]
    },
    {
        title: "Laptop Stand",
        description: "Portable adjustable laptop stand for comfortable studying and working.",
        price: 399,
        category: "Other",
        condition: "Like New",
        images: ["https://images.pexels.com/photos/34502067/pexels-photo-34502067.jpeg"]
    },
    {
        title: "Student Lunch Box",
        description: "Reusable lunch box for carrying meals to college.",
        price: 180,
        category: "Other",
        condition: "New",
        images: ["https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800"]
    }
];

async function seedProducts() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing from your .env file");
        }

        await mongoose.connect(process.env.MONGO_URI);

        let seller = await User.findOne({
            email: demoSeller.email
        });

        if (!seller) {
            seller = await User.create(demoSeller);
        }

        let inserted = 0;
        let updated = 0;

        for (const item of demoProducts) {
            const existing = await Product.findOne({
                title: item.title,
                seller: seller._id
            });

            if (existing) {
                await Product.updateOne(
                    { _id: existing._id },
                    {
                        $set: {
                            ...item,
                            seller: seller._id
                        }
                    }
                );
                updated++;
            } else {
                await Product.create({
                    ...item,
                    seller: seller._id,
                    status: "Available"
                });
                inserted++;
            }
        }

        console.log("\nCAMPUSCART product seeding completed!");
        console.log("Demo seller:", demoSeller.email);
        console.log("New products inserted:", inserted);
        console.log("Existing demo products updated:", updated);
        console.log("Total demo products:", demoProducts.length);

    } catch (error) {
        console.error("Seeding error:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seedProducts();
