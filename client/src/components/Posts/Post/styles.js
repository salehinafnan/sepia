import { makeStyles } from "@material-ui/core/styles";

export default makeStyles({
  media: {
    height: 0,
    paddingTop: "80%",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    backgroundBlendMode: "darken",
  },
  border: {
    border: "solid",
  },
  fullHeightCard: {
    height: "100%",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderRadius: "10px",
    height: "100%",
    position: "relative",
  },
  overlay: {
    position: "absolute",
    top: "10px",
    left: "20px",
    color: "white",
  },
  overlay2: {
    position: "absolute",
    top: "10px",
    right: "20px",
    color: "white",
  },
  grid: {
    display: "flex",
  },
  details: {
    display: "flex",
    justifyContent: "space-between",
    margin: "10px",
    padding: "0 5px",
  },
  title: {
    padding: "0 15px",
  },
  cardActions: {
    padding: "0 10px 8px 10px",
    display: "flex",
    justifyContent: "space-between",
  },
  modalContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    outline: "none",
    backdropFilter: "blur(10px)",
  },
  fullImage: {
    width: "95%",
    height: "95%",
    objectFit: "contain",
  },
});
