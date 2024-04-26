import { makeStyles } from "@material-ui/core/styles";

export default makeStyles((theme) => ({
  appBar: {
    borderRadius: 10,
    margin: "15px 0",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "5px 15px",
    backgroundColor: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(40px)",
  },
  heading: {
    color: "rgba(0,150,255, 1)",
    textDecoration: "none",
    [theme.breakpoints.down("sm")]: {
      fontSize: "20px",
    },
    [theme.breakpoints.up("md")]: {
      fontSize: "30px",
    },
    [theme.breakpoints.up("lg")]: {
      fontSize: "40px",
    },
  },
  image: {
    marginLeft: "10px",
  },
  toolbar: {
    display: "flex",
    justifyContent: "flex-end",
    width: "300px",
  },
  profile: {
    display: "flex",
    justifyContent: "space-between",
    width: "280px", // Default width for large screens
    "@media (max-width:900px)": {
      width: "230px", // Width for small screens
    },
    "@media (max-width:600px)": {
      width: "115px", // Width for small screens
    },
  },
  userName: {
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap",
    fontSize: "16px", // Default font size for large screens
    "@media (max-width:1200px)": {
      fontSize: "14px", // Font size for medium screens
    },
    "@media (max-width:900px)": {
      fontSize: "12px", // Font size for small screens
    },
    "@media (max-width:600px)": {
      display: "none", // Font size for extra small screens
    },
  },
  brandContainer: {
    display: "flex",
    alignItems: "center",
  },
  logout: {
    color: "white",
    [theme.breakpoints.down("sm")]: {
      fontSize: "8px",
    },
    [theme.breakpoints.up("md")]: {
      fontSize: "10px",
    },
    [theme.breakpoints.up("lg")]: {
      fontSize: "12px",
    },
  },

  signIn: {
    color: "white",
    [theme.breakpoints.down("sm")]: {
      fontSize: "8px",
    },
    [theme.breakpoints.up("md")]: {
      fontSize: "10px",
    },
    [theme.breakpoints.up("lg")]: {
      fontSize: "12px",
    },
  },
  avatar: {
    height: theme.spacing(4),
    width: theme.spacing(4),
  },
}));
