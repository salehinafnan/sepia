import { makeStyles } from "@material-ui/core/styles";

export default makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      [theme.breakpoints.down("sm")]: {
        width: "100%",
      },
    },
    "& .MuiInputBase-root": {
      [theme.breakpoints.down("sm")]: {
        fontSize: "0.8rem",
      },
    },
  },
  paper: {
    padding: theme.spacing(3),
  },
  paperText: {
    [theme.breakpoints.down("sm")]: {
      fontSize: "15px",
    },
    [theme.breakpoints.up("md")]: {
      fontSize: "20px",
    },
    [theme.breakpoints.up("lg")]: {
      fontSize: "20px",
    },
  },
  form: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  fileInput: {
    width: "97%",
    margin: "15px 0",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  buttonSubmit: {
    marginBottom: 10,
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
}));
