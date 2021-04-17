DROP DATABASE IF EXISTS sec2_gr8_database;
CREATE DATABASE sec2_gr8_database;
USE sec2_gr8_database;

CREATE TABLE login_info (
	id INT(1) PRIMARY KEY NOT NULL AUTO_INCREMENT,
	username VARCHAR(30),
    password VARCHAR(45),
    role VARCHAR(45) DEFAULT 'user'
);

CREATE TABLE user_info (
	id INT(1) NOT NULL AUTO_INCREMENT,
    email VARCHAR(45) DEFAULT '-',
    phone VARCHAR(10) DEFAULT '-',
    address VARCHAR(100) DEFAULT '-',
    city VARCHAR(30) DEFAULT '-',
    postcode INT(10) DEFAULT '-1',
    FOREIGN KEY (id) REFERENCES login_info(id)
);

CREATE TABLE product (
	prdID INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    prdName VARCHAR(30) DEFAULT '-',
    prdStock INT(5) DEFAULT '0',
    prdPrice FLOAT(5) DEFAULT '0',
    prdDescription VARCHAR(500) DEFAULT '-',
    imgSrc VARCHAR(200) DEFAULT '-'
);

INSERT INTO login_info (username, password, role) VALUES
	("Noobmaster69", "123456789", "user"),
    ("Holmes", "098765432", "user"),
    ("Watson", "234567890", "user"),
    ("Moriarty", "678912345", "user"),
	("Quinn003", "888912345", "user"),
    ("Lelouch", "345678912", "user"),
    ("admin", "admin", "admin");
    

INSERT INTO user_info (email, phone, address, city, postcode) VALUES
	("Noobmaster_69@fmail.com", "2153468524", "654 St.Saint", "New York", 235485),
    ("Detecholmes@fmail.com", "983213483", "23 Baker Street F1", "London", 1417),
    ("Doctwatson@fmail.com", "87238114", "23 Baker Street F2", "London", 1417),
    ("Villmoriarti@fmail.com", "763638282", "247 Warlingham", "London", 1498),
    ("Quinnzel003@fmail.com", "300638282", "24/7 ", "Amsterdam", 1498),
    ("VbritaniaLe@fmail.com", "973627828", "777 Britania", "Japan", 65263),
    ("admin@wongit.com", "0903434030", "888", "Nakhon Phatom", "70130");
    
    
INSERT INTO product (prdID, prdName, prdStock, prdPrice, prdDescription, imgSrc) VALUES
	("6", "DELL Alienware Area-51m R2", 10, 2000, "Gaming is better than ever on Windows 10, with games in 4K and DirectX 12. 10th Gen Intel® Core™ i9K desktop processors, support for up to 125W of power, and 10-core desktop CPU, AMD Radeon™ graphics 360Hz FHD display.", "1L9-Ur3dnHjsH6A4alt7IxNiW6qVFU0DR"),
	("5", "ASUS ROG Strix G15", 10, 1500, "The ROG Strix G15 embodies streamlined design, offering a experience for serious gaming and multitasking on Windows 10 Home. Featuring up to the latest 10th Gen Intel® Core™ i7 CPU and up to NVIDIA® GeForce RTX™ 2060 GPU, it offers high-FPS power that takes full advantage of up to a blazing fast 240Hz/3ms display.", "1SqW7De3qVrHixJ1q85NHl7xDe9Xtb3-Y"),
    ("4", "Asus ROG Zephyrus G14", 10, 2000, "ROG Zephyrus G14 is the world’s most powerful 14-inch Windows 10 Pro gaming laptop. Outclass the competition with up to an 8-core AMD Ryzen™ 9 4900HS CPU and potent GeForce RTX™ 2060 GPU that speed through everyday multitasking and gaming.", "1EmY0WPzSOiMKY-TY_d5KzgPJTDwW5cWB"),
    ("3", "Lenovo Legion 7i", 10, 1500, "Unlimited access to over 100 high-quality PC games on Windows 10 and the GeForce® RTX 2080 SUPER™ with Max Q Design is powered by the award-winning NVIDIA Turing™ architecture with more cores, higher clocks, and faster memory for ultimate performance and incredible new levels of realism.", "1BeNkRZ6XOHM7vD6WkYOkcYtq-bLgooJK"),
    ("2", "MSI GE66 Raider", 10, 3000, "GE66 Raider is the cross between aesthetics and performance, the keys to a solid laptop. The exterior of the GE66 features an oblique angle which unfolds its crafted sharp image.", "19703RAXEu-KnN8eDaphMGh8cBgWaLDhv"),
    ("1", "OMEN Laptop-15", 10, 1500, "The powerful gaming beast lets you experience high-grade graphics and processing power that meets your gaming and multitasking needs. | With AMD Ryzen7 4800H Processor up to 8 cores and 16 threads.", "1Z11aZ-wWidM31ESF-1SVprJV4XlvzoDB");