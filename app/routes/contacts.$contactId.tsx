import { Form, json, useLoaderData } from "@remix-run/react";
import { useEffect, useState, type FunctionComponent } from "react";

import { getContact, type ContactRecord } from "../data";
import { LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  //Throws an ERROR if contactId is missing stopping execution
  invariant(params.contactId, "Missing contactId param");
  const contact = await getContact(params.contactId);

  // Sends a proper 404 instead of displaying "Contact not found in the FE"
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ contact });
};

export default function Contact() {
  const { contact } = useLoaderData<typeof loader>();
  // The image is loaded by the browser
  const [isLoading, setIsLoading] = useState(true);
  // This component is probably reused instead of mount every time.
  // Using Outlet does not allow direct control over mounting
  useEffect(() => {
    setIsLoading(true);
  }, [contact.avatar]);

  return (
    <div id="contact">
      <div>
        {isLoading && (
          <div
            className="spinner"
            style={{
              width: "192px",
              height: "192px",
              color: "black",
              backgroundColor: "#e3e3e3",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "1.5rem",
              marginRight: "32px",
            }}
          >
            Loading...
          </div>
        )}
        <img
          alt={`${contact.first} ${contact.last} avatar`}
          key={contact.avatar}
          src={contact.avatar}
          onLoad={() => setIsLoading(false)}
          style={{ display: isLoading ? "none" : "block" }}
        />
      </div>

      <div>
        <h1>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}{" "}
          <Favorite contact={contact} />
        </h1>

        {contact.twitter ? (
          <p>
            <a href={`https://twitter.com/${contact.twitter}`}>
              {contact.twitter}
            </a>
          </p>
        ) : null}

        {contact.notes ? <p>{contact.notes}</p> : null}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>

          <Form
            action="destroy"
            method="post"
            onSubmit={(event) => {
              const response = confirm(
                "Please confirm you want to delete this record.",
              );
              if (!response) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

const Favorite: FunctionComponent<{
  contact: Pick<ContactRecord, "favorite">;
}> = ({ contact }) => {
  const favorite = contact.favorite;

  return (
    <Form method="post">
      <button
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        name="favorite"
        value={favorite ? "false" : "true"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </Form>
  );
};
