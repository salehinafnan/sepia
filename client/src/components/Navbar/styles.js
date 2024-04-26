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
    width: "200px",
  },
  userName: {
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap",
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
