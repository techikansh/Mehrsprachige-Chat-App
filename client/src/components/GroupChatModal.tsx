import React, { useEffect, useState } from "react";
import { MdCancel } from "react-icons/md";
import { RootState } from "../store/store";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";

interface GroupChatModalProps {
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedChat: React.Dispatch<React.SetStateAction<any>>;
}

const GroupChatModal: React.FC<GroupChatModalProps> = ({ setOpenModal, setSelectedChat }) => {
  const [imageToUpload, setImageToUpload] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [groupName, setGroupName] = useState<string>("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantsPopulated, setParticipantsPopulated] = useState<any[]>([]);
  const [commonLanguage, setCommonLanguage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [fetchedUsers, setFetchedUsers] = useState<any[]>([]);

  const [error, setError] = useState<string | null>(null);
  const { token } = useSelector((state: RootState) => state.user);

  const createGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("participants", participants);
    console.log(groupName, commonLanguage)
    const url = BASE_URL + "chat/createGroup";
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          groupName,
          participants,
          commonLanguage,
          imageUrl,
        }),
      })
      const data = await res.json();
      console.log(data);
      if (data.success) {
        setSelectedChat(data.chat);
        setOpenModal(false);
      }
      else {
        setError(data.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const fetchUsers = async () => {
    setError(null);
    const url = BASE_URL + "chat/findUsers";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        searchString: searchTerm,
      }),
    });
    const data = await res.json();
    if (data.success) {
      console.log(data.users);
      setFetchedUsers(data.users);
    } else {
      setError(data.message);
      console.log(data.message);
    }
  };

  useEffect(() => {
    if (searchTerm.length >= 3) fetchUsers();
    else setFetchedUsers([]);
  }, [searchTerm]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4">
        {/* Top section */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Neue Gruppe erstellen</h2>
          <button className="p-1 rounded-full">
            <MdCancel className="w-6 h-6" onClick={() => setOpenModal(false)} />
          </button>
        </div>

        {/* Form */}
        <form
          className="p-4 gap-4 flex flex-col items-center"
          onSubmit={createGroup}
        >
          <div>
            <img
              src={
                imageUrl ||
                "https://cdn-icons-png.flaticon.com/512/718/718339.png"
              }
              alt="Group Icon"
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
            />
          </div>

          <div className="flex items-center gap-4 w-full px-8 mt-8">
            <label className="w-24">Gruppename</label>
            <input
              type="text"
              placeholder="Gruppenname"
              className="p-2 border rounded-md w-80 outline-none"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-4 w-full px-8">
            <label className="w-24">Teilnehmer</label>
            <div className="relative flex flex-col w-80">
              <div className="p-2 border rounded-md w-full flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="zur Suche Name eingeben"
                  className="w-full outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <MdCancel
                    className="text-gray-400 hover:text-gray-600 cursor-pointer w-5 h-5"
                    onClick={() => {
                      setSearchTerm("");
                      setFetchedUsers([]);
                    }}
                  />
                )}
              </div>
              {/* Search Results Dropdown */}
              <div
                className="absolute w-full bg-white rounded-lg shadow-xl border border-gray-100 max-h-96 overflow-y-auto z-20"
                style={{ top: "100%" }} // Ensures the dropdown appears just below the input field
              >
                {fetchedUsers.map((fetchedUser, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                    onClick={() => {
                      setParticipants([...participants, fetchedUser._id]);
                      setParticipantsPopulated([
                        ...participantsPopulated,
                        fetchedUser,
                      ]);
                      setSearchTerm("");
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={fetchedUser.avatar}
                        alt={`${fetchedUser.firstName}'s avatar`}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {fetchedUser.firstName} {fetchedUser.lastName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {fetchedUser.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full px-8">
            <label className="w-24">Sprache</label>
            <select
              className="p-2 border rounded-md w-80 outline-none"
              value={commonLanguage}
              onChange={(e) => setCommonLanguage(e.target.value)}
              required
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
              <option value="ru">Russian</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
            </select>
          </div>

          {participantsPopulated.length > 0 && (
            <div className="min-w-[400px] max-w-lg border shadow-md rounded-md">
              <div className="flex flex-col items-center w-full">
                <h1 className="pt-4 pb-2 px-2 self-start text-xl font-semibold border-b w-full">
                  Teilnehmer
                </h1>

                <div className="flex flex-col w-full px-2 py-2 gap-4 max-h-72 overflow-y-auto">
                  {participantsPopulated.map((participant, index) => (
                    <div
                      className="flex items-center gap-3 w-full px-2"
                      key={index}
                    >
                      <img
                        src={participant.avatar}
                        alt={`${participant.firstName}'s avatar`}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {participant.firstName} {participant.lastName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {participant.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="bg-black text-white rounded-md p-2 px-4 shrink-0 mt-8 mb-4"
          >
            Erstellen
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroupChatModal;
