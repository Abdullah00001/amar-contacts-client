import {
  ChangeEvent,
  Dispatch,
  FC,
  MouseEvent,
  useEffect,
  useState,
} from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import ContactServices from '../../../services/contacts.services';
import { TImage } from '../../../interfaces/contacts.interface';
import DateUtils from '../../../utils/date.utils';

interface ITrashTableBodyRowProps {
  name: string;
  avatar: TImage;
  id: string;
  trashedAt: string;
  selectedContacts: string[];
  setSelectedContacts: Dispatch<React.SetStateAction<string[]>>;
}
const { processSingleDelete, processSingleContactRecover } = ContactServices;
const { formatDate } = DateUtils;

const TrashTableBodyRow: FC<ITrashTableBodyRowProps> = ({
  name,
  id,
  avatar,
  selectedContacts,
  trashedAt,
  setSelectedContacts,
}) => {
  const queryClient = useQueryClient();
  const isSelected = selectedContacts.includes(id);
  const [isHover, setIsHover] = useState(false);
  const { isPending: isSingleDeletePending, mutate: singleDelete } =
    useMutation({
      mutationFn: async () => await processSingleDelete({ id }),
      mutationKey: ['trash', id],
      onSuccess: () => {
        toast.dismiss();
        queryClient.invalidateQueries({ queryKey: ['trash'] });
        toast.success('Contact Deleted');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  const {
    isPending: isSingleContactRecoverPending,
    mutate: singleContactRecover,
  } = useMutation({
    mutationFn: async () => await processSingleContactRecover({ id }),
    mutationKey: ['trash', id],
    onSuccess: () => {
      toast.dismiss();
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact recovered');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const handleSelect = (e: ChangeEvent<HTMLInputElement> | MouseEvent) => {
    e.stopPropagation();
    setSelectedContacts((prev) =>
      isSelected ? prev.filter((contactId) => contactId !== id) : [...prev, id]
    );
  };
  useEffect(() => {
    if (!isSingleDeletePending) return;
    toast.dismiss();
    toast.info('Working...');
  }, [isSingleDeletePending]);
  useEffect(() => {
    if (!isSingleContactRecoverPending) return;
    toast.dismiss();
    toast.info('Working...');
  }, [isSingleContactRecoverPending]);
  return (
    <tr
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className={`${isSelected && 'bg-blue-300'} ${
        isSelected ? 'hover:bg-blue-300' : 'hover:bg-gray-300'
      }  cursor-pointer transition-all duration-300 ease-in-out`}
    >
      {/* For Laptop And Desktop Devices */}
      <td className="pl-3  py-2 hidden lg:block">
        <div className="flex items-center space-x-2">
          <div
            className="w-[40px] h-[40px] rounded-full cursor-pointer flex justify-center items-center  duration-300 ease-in-out"
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
          >
            {isSelected ? (
              <input
                checked={isSelected}
                onChange={handleSelect}
                type="checkbox"
                className="cursor-pointer w-5 h-5"
              />
            ) : isHover ? (
              <input
                checked={isSelected}
                onChange={handleSelect}
                type="checkbox"
                className="cursor-pointer w-5 h-5"
              />
            ) : (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(e);
                }}
              >
                {avatar.url ? (
                  <img
                    src={avatar.url}
                    alt="Avatar"
                    className="w-10 h-10 cursor-pointer rounded-full"
                  />
                ) : (
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${name}`}
                    alt="Avatar"
                    className="w-10 h-10 cursor-pointer rounded-full"
                  />
                )}
              </div>
            )}
          </div>
          <div>{name}</div>
        </div>
      </td>
      {/* For Tablet And Mobile Devices */}
      <td className="pl-3  py-2 lg:hidden">
        <div className="flex items-center space-x-2">
          <div
            onClick={handleSelect}
            className={`w-[40px] h-[40px] rounded-full cursor-pointer flex justify-center items-center  duration-300 ease-in-out`}
          >
            {isSelected ? (
              <input
                checked={isSelected}
                onChange={handleSelect}
                name="selectCheckbox"
                type="checkbox"
                className="cursor-pointer w-5 h-5"
              />
            ) : (
              <>
                {avatar.url ? (
                  <img
                    src={avatar.url}
                    alt="Avatar"
                    className="w-10 h-10 cursor-pointer rounded-full"
                  />
                ) : (
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${name}`}
                    alt="Avatar"
                    className="w-10 h-10 cursor-pointer rounded-full"
                  />
                )}
              </>
            )}
          </div>
          <div>{name}</div>
        </div>
      </td>
      <td className="lg:hidden"></td>
      {/* Date Column (centered always) */}
      <td className="w-1/3 py-2 text-center hidden lg:table-cell">
        <span>{formatDate(trashedAt)}</span>
      </td>

      {/* Actions Column (right-aligned, only visible on hover) */}
      <td className="w-1/3 py-2 pr-4 hidden lg:table-cell">
        <div className="flex justify-end items-center space-x-2">
          {isHover && (
            <>
              <button
                onClick={() => singleContactRecover()}
                className="text-[#115bd0] cursor-pointer font-[400] px-4 py-2 hover:bg-[#cadff5] rounded-full transition"
              >
                Recover
              </button>
              <button
                onClick={() => singleDelete()}
                className="text-[#115bd0] cursor-pointer font-[400] px-4 py-2 hover:bg-[#cadff5] rounded-full transition"
              >
                Delete Forever
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TrashTableBodyRow;
