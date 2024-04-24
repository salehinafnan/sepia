import { makeStyles } from "@material-ui/core/styles";
import { deepPurple } from "@material-ui/core/colors";

export default makeStyles((theme) => ({
  appBar: {
    borderRadius: 10,
    margin: "20px 0",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "5px 30px",
    backgroundColor: "rgba(255,255,255,0.8)", // smokey color with 50% opacity
  },
  heading: {
    color: "rgba(0,150,255, 1)",
    textDecoration: "none",
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
    width: "250px",
  },
  userName: {
    display: "flex",
    alignItems: "center",
  },
  brandContainer: {
    display: "flex",
    alignItems: "center",
  },
  purple: {
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: deepPurple[500],
  },
}));
