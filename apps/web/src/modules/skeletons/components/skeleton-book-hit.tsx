const SkeletonBookHit = () => {
  return (
    <div className='grid grid-cols-[122px_1fr] gap-x-4'>
      <div className='aspect-[29/34] w-[122px] bg-gray-100'></div>
      <div className='text-base-regular flex flex-col gap-y-8'>
        <div className='flex items-start justify-between'>
          <div className='flex flex-col gap-y-2'>
            <div className='h-6 w-32 bg-gray-100'></div>
            <div className='h-3 w-24 bg-gray-100'></div>
            <div className='h-3 w-24 bg-gray-100'></div>
          </div>
          <div className='h-8 w-20 bg-gray-100'></div>
        </div>
        <div className='text-small-regular flex flex-1 items-end justify-between'></div>
      </div>
    </div>
  );
};

export default SkeletonBookHit;
