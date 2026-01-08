import { useState } from "react";
import { useSubIdContext } from "../../contexts/SubIdContext";
import { useImageIssues } from "../../hooks/useImageIssues";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { QueryLoadingWrapper } from "../../components/ui/loading-wrapper";

export default function ImageIssuePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImagePopup, setSelectedImagePopup] = useState<string | null>(null);
  const { subId } = useSubIdContext();

  const { data, isLoading, error } = useImageIssues({ 
    page: currentPage,
    limit: pageLimit,
    subId: subId || "686756400ae6dcd28bee12af"
  });

  // Filter images based on search term
  const filteredImages = data?.data?.filter((image) =>
    image.filename?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (limit: number) => {
    setPageLimit(limit);
    setCurrentPage(1);
  };

  return (
    <div className="pt-0 px-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {/* ส่วนของชื่อหน้าและ Organization */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold  truncate">
            Image Issues
          </h1>
          <p className=" truncate">Images that have problems and need correction</p>
          <p className=" truncate text-sm">Organization: <span className="font-semibold">{subId}</span></p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 bg-white"
            />
          </div>

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white whitespace-nowrap">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filter ({pageLimit}/page)
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleLimitChange(10)}>Show 10 images/page</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLimitChange(20)}>Show 20 images/page</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLimitChange(50)}>Show 50 images/page</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLimitChange(100)}>Show 100 images/page</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold ">{data?.totalRecords?.toLocaleString() || 0}</div>
            <div className="text-sm  mt-1">Total Images</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold ">{data?.totalPages?.toLocaleString() || 0}</div>
            <div className="text-sm  mt-1">Total Pages</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold ">{data?.currentPage || 0}</div>
            <div className="text-sm  mt-1">Current Page</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold ">{filteredImages.length}</div>
            <div className="text-sm  mt-1">Filtered Results</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Loading Wrapper */}
      <QueryLoadingWrapper
        query={{ data, isLoading, error }}
        loadingText="Loading images..."
        emptyMessage="No problem images found"
      >
        {() => (
          <>
            {/* Grid แสดงรูปภาพ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredImages.map((issue, index) => (
                <Card key={`${issue.filename}-${index}`} className="group hover:shadow-lg transition-shadow">
                  <div className="relative overflow-hidden">
                    <img 
                      src={issue.signedUrl} 
                      alt={issue.filename}
                      className="w-full h-48 object-cover cursor-pointer transition duration-200 group-hover:brightness-75"
                      onClick={() => setSelectedImagePopup(issue.signedUrl)}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 truncate" title={issue.filename}>
                      {issue.filename}
                    </h3>
                    <div className="text-sm  mb-2">
                      Image #{(currentPage - 1) * pageLimit + index + 1}
                    </div>
                    <div className="text-xs">
                      File has issues that need review
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>

                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) =>
                  (Math.abs(page - currentPage) <= 2 || page === 1 || page === data.totalPages) ? (
                    <Button
                      key={page}
                      size="sm"
                      variant={page === currentPage ? "default" : "outline"}
                      onClick={() => handlePageChange(page)}
                      className={page === currentPage ? "bg-gray-100 text-gray-700 font-semibold" : "text-gray-600"}
                    >
                      {page}
                    </Button>
                  ) : (
                    (page === currentPage - 3 || page === currentPage + 3) &&
                    <span key={page} className="text-gray-400">...</span>
                  )
                )}

                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === data.totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </QueryLoadingWrapper>

      {/* Popup Modal for viewing images */}
      {selectedImagePopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedImagePopup(null)}
        >
          <div
            className="relative max-w-3xl w-full flex flex-col items-center"
            onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 bg-white/80 rounded-full p-2 shadow hover:bg-white"
              onClick={() => setSelectedImagePopup(null)}
              title="Close">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImagePopup}
              alt="popup"
              className="rounded-lg max-h-[80vh] max-w-full shadow-lg border-2 border-white"
            />
          </div>
        </div>
      )}
    </div>
  );
} 