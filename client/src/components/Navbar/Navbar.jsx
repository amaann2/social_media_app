import './Navbar.css'
import { TbCloudUpload } from "react-icons/tb";
import { BsSendArrowDown } from "react-icons/bs";
import { FaRegBell } from "react-icons/fa";
const Navbar = () => {
    return (
        <div className='navbar'>
            <h2 className="logo">InstaVue</h2>
            <input type="text" placeholder='Search' className='navbar-input' />
            <ul >
                <li className='navbar-list'><TbCloudUpload className='navbar-icon' /></li>
                <li className='navbar-list'><BsSendArrowDown className='navbar-icon' /></li>
                <li className='navbar-list'><FaRegBell className='navbar-icon' /></li>
                <li className='navbar-list '>Amaan</li>
            </ul>
        </div>
    )
}

export default Navbar